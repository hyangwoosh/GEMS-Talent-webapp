import type { AdapterOutcome, EnquiryEnv, EnquiryPayload } from './types';

/**
 * Zoho CRM — the lead record, and the source of truth for the pipeline.
 *
 * Datacentre is US (.com), confirmed against the org. Zoho's API hostnames are
 * per-datacentre and a mismatch returns 401 with no explanation, so these are
 * pinned rather than derived.
 */
const ACCOUNTS = 'https://accounts.zoho.com';
const API = 'https://www.zohoapis.com';

/**
 * Only standard Lead fields are used. Zoho CRM Free has no custom fields, and
 * the org drops from its Enterprise trial to Free on 12 September 2026 — a
 * payload built on custom fields would start failing that day.
 */
interface ZohoLead {
  Last_Name: string;
  First_Name?: string;
  Email: string;
  Phone?: string;
  Company?: string;
  Description: string;
  Lead_Source: string;
}

/**
 * `Lead_Source` is a picklist and "Website" is NOT one of its values out of the
 * box. Sending an unknown value is rejected. "Web Research" is the closest
 * stock entry; add "Website" to the picklist in Zoho and change this if you
 * prefer it to read properly in reports.
 */
const LEAD_SOURCE = 'Web Research';

/** Access tokens last an hour; the refresh token does not expire. */
async function mintAccessToken(env: EnquiryEnv): Promise<string> {
  const res = await fetch(`${ACCOUNTS}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.ZOHO_CLIENT_ID!,
      client_secret: env.ZOHO_CLIENT_SECRET!,
      refresh_token: env.ZOHO_REFRESH_TOKEN!,
    }),
  });

  const body = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(`token exchange failed (${res.status}): ${body.error ?? 'no access_token'}`);
  }
  return body.access_token;
}

/** Zoho requires Last_Name. Split on the last space so "Mary Anne Tan" → "Tan". */
function splitName(full: string): { first?: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { last: parts[0]! };
  return { first: parts.slice(0, -1).join(' '), last: parts.at(-1)! };
}

export async function createLead(
  payload: EnquiryPayload,
  env: EnquiryEnv,
): Promise<AdapterOutcome> {
  if (!env.ZOHO_CLIENT_ID || !env.ZOHO_CLIENT_SECRET || !env.ZOHO_REFRESH_TOKEN) {
    return { ok: false, adapter: 'zoho', error: 'not configured', skipped: true };
  }

  try {
    const token = await mintAccessToken(env);
    const { first, last } = splitName(payload.name);

    // The context tag is what makes "which artistes drive enquiries" answerable
    // from CRM reports rather than something we would have to build.
    const contextLine = payload.context
      ? `${payload.context.kindLabel}: ${payload.context.label} (${payload.context.slug})\n\n`
      : '';

    const lead: ZohoLead = {
      Last_Name: last,
      First_Name: first,
      Email: payload.email,
      Phone: payload.phone || undefined,
      Description: `${contextLine}Subject: ${payload.subject}\n\n${payload.message}`,
      Lead_Source: LEAD_SOURCE,
    };

    const res = await fetch(`${API}/crm/v8/Leads`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [lead] }),
    });

    const body = (await res.json()) as {
      data?: Array<{ code?: string; message?: string; details?: { id?: string } }>;
    };
    const row = body.data?.[0];

    if (!res.ok || row?.code !== 'SUCCESS') {
      throw new Error(`${res.status} ${row?.code ?? 'unknown'}: ${row?.message ?? 'no detail'}`);
    }
    return { ok: true, adapter: 'zoho', detail: row.details?.id };
  } catch (err) {
    return { ok: false, adapter: 'zoho', error: err instanceof Error ? err.message : String(err) };
  }
}
