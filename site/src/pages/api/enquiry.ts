import type { APIRoute } from 'astro';
import { createLead } from '../../lib/enquiry/zoho';
import { sendAlert } from '../../lib/enquiry/telegram';
import { sendAutoReply } from '../../lib/enquiry/resend';
import { getEnv } from '../../lib/enquiry/env';
import type { AdapterOutcome, EnquiryContext, EnquiryEnv, EnquiryPayload } from '../../lib/enquiry/types';

export const prerender = false;

/**
 * POST /api/enquiry
 *
 * Replaces netlify/functions/enquiry.js. Two things change.
 *
 * 1. There is now a store. The legacy function sent two emails and kept
 *    nothing; if Resend threw it returned 502 and the enquiry was gone —
 *    no retry, no queue, no record. Zoho CRM is now the source of truth, and
 *    a 200 is returned whenever the lead was recorded, regardless of email.
 *
 * 2. The adapters fan out in parallel via allSettled rather than two
 *    sequential awaits, which roughly halves response time.
 *
 * Carried forward unchanged from the legacy function: honeypot field,
 * minimum fill-time check, required-field and email validation, the 5000
 * character cap, and soft-rejecting spam with 200 OK — a hard reject just
 * teaches bots to retry.
 */

const MIN_FILL_TIME_MS = 1_500;
const MAX_MESSAGE_LENGTH = 5_000;
const ALLOWED_ORIGINS = ['https://gemstalent.com.sg', 'https://www.gemstalent.com.sg'];

interface RequestBody {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  context?: { kind?: string; slug?: string; label?: string } | null;
  /** Honeypot. Real people never see this field; bots fill it in. */
  company_url?: string;
  /** Set by the form on mount, used for the fill-time check. */
  _formMountedAt?: number;
  /** Cloudflare Turnstile response, when the widget is present. */
  turnstileToken?: string;
}

function corsHeaders(origin: string | null): Record<string, string> {
  // The legacy function used Access-Control-Allow-Origin: *, which let any site
  // POST to this endpoint. Narrowed to the site's own origins.
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]!;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/** Bots get 200 OK. A hard reject tells them to try something else. */
function softReject(origin: string | null, reason: string): Response {
  console.warn(`[enquiry] soft-rejected: ${reason}`);
  return json({ ok: true }, 200, origin);
}

function parseContext(raw: RequestBody['context']): EnquiryContext | null {
  if (!raw || typeof raw !== 'object') return null;
  const kind = String(raw.kind ?? '').trim();
  const slug = String(raw.slug ?? '').trim();
  const label = String(raw.label ?? '').trim();

  if (kind !== 'artiste' && kind !== 'service') return null;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  if (!label || label.length > 120) return null;

  return { kind, slug, label, kindLabel: kind === 'artiste' ? 'Artiste' : 'Service' };
}

/** Cloudflare Turnstile. Skipped when no secret is configured. */
async function verifyTurnstile(token: string | undefined, env: EnquiryEnv, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    const body = (await res.json()) as { success?: boolean };
    return body.success === true;
  } catch {
    // Fail open. A dropped guarantee beats locking out a real client.
    console.warn('[enquiry] turnstile verification errored — allowing through');
    return true;
  }
}

export const OPTIONS: APIRoute = ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = request.headers.get('origin');
  const env = await getEnv();

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return json({ error: 'Malformed request.' }, 400, origin);
  }

  // ── spam checks — soft-reject, always 200 ──────────────────────────────
  if (body.company_url && String(body.company_url).trim()) {
    return softReject(origin, 'honeypot filled');
  }

  if (body._formMountedAt && Number.isFinite(Number(body._formMountedAt))) {
    const elapsed = Date.now() - Number(body._formMountedAt);
    if (elapsed >= 0 && elapsed < MIN_FILL_TIME_MS) {
      return softReject(origin, `submitted in ${elapsed}ms`);
    }
  }

  const ip = request.headers.get('cf-connecting-ip') ?? clientAddress ?? 'unknown';
  if (!(await verifyTurnstile(body.turnstileToken, env, ip))) {
    return softReject(origin, 'turnstile failed');
  }

  // ── validation — these are real errors, so real status codes ───────────
  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const subject = (body.subject ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || !email || !subject || !message) {
    return json({ error: 'Please fill in every required field.' }, 400, origin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'That email address does not look right.' }, 400, origin);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: 'That message is too long. Please keep it under 5,000 characters.' }, 400, origin);
  }

  const payload: EnquiryPayload = {
    name,
    email,
    phone,
    subject,
    message,
    context: parseContext(body.context),
    receivedAt: new Date().toISOString(),
  };

  // ── fan out ───────────────────────────────────────────────────────────
  // allSettled, never all: one adapter failing must not take the others with
  // it, and must never lose the enquiry.
  const settled = await Promise.allSettled([
    createLead(payload, env),
    sendAlert(payload, env),
    sendAutoReply(payload, env),
  ]);

  const outcomes: AdapterOutcome[] = settled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { ok: false, adapter: ['zoho', 'telegram', 'resend'][i]!, error: String(r.reason) },
  );

  for (const o of outcomes) {
    if (!o.ok && !o.skipped) console.error(`[enquiry] ${o.adapter} failed: ${o.error}`);
    else if (!o.ok) console.warn(`[enquiry] ${o.adapter} skipped: ${o.error}`);
  }

  const store = outcomes.find((o) => o.adapter === 'zoho')!;
  const alert = outcomes.find((o) => o.adapter === 'telegram')!;

  // Success if the enquiry was recorded ANYWHERE a human will see it. Email is
  // best-effort; a failed auto-reply is an annoyance, a lost lead is not.
  if (store.ok || alert.ok) {
    return json({ ok: true }, 200, origin);
  }

  console.error('[enquiry] every adapter failed — enquiry not recorded', { outcomes });
  return json(
    { error: 'We could not record your enquiry. Please email marketing@gemstalent.com.sg.' },
    502,
    origin,
  );
};
