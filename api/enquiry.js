/**
 * GEMS Talent — Enquiry submission endpoint
 * ────────────────────────────────────────────────────────────────
 * Vercel-style serverless function. Drop-in compatible with:
 *   • Vercel  (deploy as /api/enquiry.js — works out of the box)
 *   • Netlify (rename to netlify/functions/enquiry.js — minor tweak below)
 *   • Cloudflare Workers (export default { fetch })
 *
 * Sends TWO emails on every submission via Resend:
 *   1. Team notification → talent@gems.sg with the enquiry contents
 *   2. Auto-reply        → the enquirer with an "Enquiry received" confirmation
 *
 * REQUIRED ENVIRONMENT VARIABLES (set in your hosting dashboard):
 *   RESEND_API_KEY   — your Resend API key (starts with "re_")
 *   ENQUIRY_TO       — destination mailbox      (e.g. talent@gems.sg)
 *   ENQUIRY_FROM     — verified sender address  (e.g. enquiries@gemstalent.com.sg)
 *   ENQUIRY_REPLY_TO — optional, defaults to ENQUIRY_TO
 */

const TEAM_TEMPLATE = require("../email-templates/team-notification.js");
const AUTO_REPLY    = require("../email-templates/auto-reply.js");

const RESEND_URL = "https://api.resend.com/emails";

// ─────────────────────────────────────────────────────────────────
// Anti-spam — per-IP rate limit.
//
// Two backends, chosen at request time:
//
//   1. **Upstash Redis (REST)** — used when both UPSTASH_REDIS_REST_URL
//      and UPSTASH_REDIS_REST_TOKEN are set. Shared across regions and
//      survives cold starts; this is the production-grade path.
//
//   2. **In-memory Map** — fallback when no KV env is configured. Cold
//      starts and cross-region instances each get a fresh map, so this
//      only deters casual scrapers; fine for dev / preview.
//
// Counters: per-IP, two windows (1 min / 1 hr). The Redis path uses
// INCR + EXPIRE NX in a single pipeline call (one HTTP round-trip).
// ─────────────────────────────────────────────────────────────────
const RL_WINDOW_SHORT_MS = 60 * 1000;       // 1 minute
const RL_WINDOW_LONG_MS  = 60 * 60 * 1000;  // 1 hour
const RL_MAX_SHORT       = 3;               // per minute per IP
const RL_MAX_LONG        = 10;              // per hour per IP
const MIN_FILL_TIME_MS   = 1500;            // form mount → submit minimum

const ipHits = new Map(); // in-memory fallback: ip -> number[] (ms timestamps)

function clientIp(req) {
  const xff = req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"]);
  if (xff) return String(xff).split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function rateLimitedMemory(ip) {
  const now = Date.now();
  const cutoff = now - RL_WINDOW_LONG_MS;
  const hits = (ipHits.get(ip) || []).filter((t) => t >= cutoff);
  const shortHits = hits.filter((t) => t >= now - RL_WINDOW_SHORT_MS).length;
  const longHits  = hits.length;
  if (shortHits >= RL_MAX_SHORT || longHits >= RL_MAX_LONG) return true;
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

// Upstash REST pipeline:  POST <URL>/pipeline  with [[cmd, ...args], ...]
// Returns [{result}|{error}, ...] in the same order. We use INCR + EXPIRE NX
// for each window so the first hit sets the TTL and subsequent hits don't
// touch it. One HTTP call per request.
async function rateLimitedRedis(ip, { url, token }) {
  const kShort = `gems:rl:short:${ip}`;
  const kLong  = `gems:rl:long:${ip}`;
  const body = [
    ["INCR",   kShort],
    ["EXPIRE", kShort, String(Math.ceil(RL_WINDOW_SHORT_MS / 1000)), "NX"],
    ["INCR",   kLong],
    ["EXPIRE", kLong,  String(Math.ceil(RL_WINDOW_LONG_MS  / 1000)), "NX"],
  ];
  const res = await fetch(url.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Upstash ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const out = await res.json();
  // Pipeline returns either [{result|error}, ...] or a bare [result, ...]
  // depending on Upstash version. Normalise.
  const pick = (i) => {
    const r = out[i];
    if (r && typeof r === "object" && "result" in r) return r.result;
    return r;
  };
  const shortCount = Number(pick(0)) || 0;
  const longCount  = Number(pick(2)) || 0;
  return shortCount > RL_MAX_SHORT || longCount > RL_MAX_LONG;
}

async function rateLimited(ip) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await rateLimitedRedis(ip, { url, token });
    } catch (err) {
      // Fail open on KV errors — the in-memory fallback still catches
      // bursts within a single warm instance.
      console.warn("[enquiry] Upstash unavailable, falling back to memory:", err.message);
      return rateLimitedMemory(ip);
    }
  }
  return rateLimitedMemory(ip);
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function sendViaResend({ apiKey, from, to, replyTo, subject, html, text }) {
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from, to, subject, html, text,
      reply_to: replyTo || undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  return res.json();
}

module.exports = async function handler(req, res) {
  // CORS — adjust origin to your production domain in prod
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Method not allowed" });

  // Env
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO   = process.env.ENQUIRY_TO   || "talent@gems.sg";
  const FROM = process.env.ENQUIRY_FROM || "GEMS Talent <enquiries@gemstalent.com.sg>";
  const REPLY_TO = process.env.ENQUIRY_REPLY_TO || TO;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Server not configured (missing RESEND_API_KEY)" });
  }

  // Parse + validate
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const {
    name = "", email = "", phone = "", subject = "", message = "",
    context = null,
    company_url = "",      // honeypot — must be empty
    _formMountedAt = 0,    // client mount timestamp (ms)
  } = body || {};

  // ── Anti-spam gates ─────────────────────────────────────────────
  // We answer 200 OK on every soft-rejection so bots think they
  // succeeded and stop retrying. Real users never trip these paths.
  if (company_url && String(company_url).trim()) {
    console.warn("[enquiry] honeypot filled — dropping silently");
    return res.status(200).json({ ok: true });
  }
  if (_formMountedAt && Number.isFinite(Number(_formMountedAt))) {
    const elapsed = Date.now() - Number(_formMountedAt);
    if (elapsed >= 0 && elapsed < MIN_FILL_TIME_MS) {
      console.warn(`[enquiry] submitted in ${elapsed}ms — dropping silently`);
      return res.status(200).json({ ok: true });
    }
  }
  const ip = clientIp(req);
  if (await rateLimited(ip)) {
    console.warn(`[enquiry] rate-limited ip=${ip}`);
    return res.status(429).json({ error: "Too many requests. Please try again in a moment." });
  }

  if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: "Message too long." });
  }

  // Validate optional context — clients pass { kind, slug, label } when the
  // enquiry deep-linked from an artiste or service page. Reject anything
  // malformed so it never reaches the email template.
  let safeContext = null;
  if (context && typeof context === "object") {
    const kind  = String(context.kind  || "").trim();
    const slug  = String(context.slug  || "").trim();
    const label = String(context.label || "").trim();
    if ((kind === "artiste" || kind === "service") &&
        /^[a-z0-9-]{1,80}$/.test(slug) &&
        label.length > 0 && label.length <= 120) {
      safeContext = {
        kind,
        slug,
        label: escapeHtml(label),
        rawLabel: label,
        kindLabel: kind === "artiste" ? "Artiste" : "Service",
      };
    }
  }

  const safe = {
    name:    escapeHtml(name.trim()),
    email:   escapeHtml(email.trim()),
    phone:   escapeHtml(phone.trim()),
    subject: escapeHtml(subject.trim()),
    message: escapeHtml(message.trim()).replace(/\n/g, "<br/>"),
    rawMessage: message.trim(),
    receivedAt: new Date().toUTCString(),
    context: safeContext,
  };

  // Prefix the team-email subject so context is visible in the inbox list.
  const teamSubjectPrefix = safeContext
    ? `[${safeContext.kindLabel} · ${safeContext.rawLabel}] `
    : "[Enquiry] ";

  try {
    // 1) Notify the team
    await sendViaResend({
      apiKey: RESEND_API_KEY,
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: `${teamSubjectPrefix}${safe.subject} — ${safe.name}`,
      html: TEAM_TEMPLATE(safe),
      text:
        `New enquiry — GEMS Talent\n\n` +
        (safeContext ? `${safeContext.kindLabel}: ${safeContext.rawLabel} (${safeContext.slug})\n` : "") +
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\n` +
        `Subject: ${subject}\n\n${message}\n`,
    });

    // 2) Auto-reply to the enquirer
    await sendViaResend({
      apiKey: RESEND_API_KEY,
      from: FROM,
      to: [email],
      replyTo: REPLY_TO,
      subject: `We've received your enquiry — GEMS Talent`,
      html: AUTO_REPLY(safe),
      text:
        `Hi ${name},\n\n` +
        `Thanks for getting in touch with GEMS Talent. ` +
        `We've received your enquiry and will get back within two working days.\n\n` +
        `For reference, here's what you sent:\n` +
        `Subject: ${subject}\n\n${message}\n\n` +
        `— The GEMS Talent team\n${REPLY_TO}\n`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Enquiry send failed:", err);
    return res.status(502).json({ error: "Could not send enquiry. Please email " + REPLY_TO });
  }
};
