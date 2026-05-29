/**
 * GEMS Talent — Enquiry submission endpoint (Netlify Function)
 * ────────────────────────────────────────────────────────────────
 * Sends TWO emails on every submission via Resend:
 *   1. Team notification → ENQUIRY_TO with the enquiry contents
 *   2. Auto-reply        → the enquirer with an "Enquiry received" confirmation
 *
 * REQUIRED ENVIRONMENT VARIABLES (set in Netlify dashboard):
 *   RESEND_API_KEY   — Resend API key (starts with "re_")
 *   ENQUIRY_TO       — destination mailbox (e.g. terence.tan@gemstalent.com.sg)
 *   ENQUIRY_FROM     — verified sender    (e.g. GEMS Talent <enquiries@gemstalent.com.sg>)
 *   ENQUIRY_REPLY_TO — optional, defaults to ENQUIRY_TO
 *   STAMP_URL        — absolute URL for the brass stamp logo in emails
 */

const TEAM_TEMPLATE = require("../../email-templates/team-notification.js");
const AUTO_REPLY    = require("../../email-templates/auto-reply.js");

const RESEND_URL = "https://api.resend.com/emails";

// ── In-memory rate limit (function-instance-scoped) ──────────────
// At <100 enquiries/mo this is sufficient. Upstash removed per ADR-005.
const RL_WINDOW_SHORT_MS = 60 * 1000;
const RL_WINDOW_LONG_MS  = 60 * 60 * 1000;
const RL_MAX_SHORT       = 3;
const RL_MAX_LONG        = 10;
const MIN_FILL_TIME_MS   = 1500;

const ipHits = new Map();

function rateLimited(ip) {
  const now    = Date.now();
  const cutoff = now - RL_WINDOW_LONG_MS;
  const hits   = (ipHits.get(ip) || []).filter((t) => t >= cutoff);
  const shortHits = hits.filter((t) => t >= now - RL_WINDOW_SHORT_MS).length;
  if (shortHits >= RL_MAX_SHORT || hits.length >= RL_MAX_LONG) return true;
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
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
    body: JSON.stringify({ from, to, subject, html, text, reply_to: replyTo || undefined }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  return res.json();
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO       = process.env.ENQUIRY_TO   || "talent@gems.sg";
  const FROM     = process.env.ENQUIRY_FROM || "GEMS Talent <enquiries@gemstalent.com.sg>";
  const REPLY_TO = process.env.ENQUIRY_REPLY_TO || TO;

  if (!RESEND_API_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Server not configured (missing RESEND_API_KEY)" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }

  const {
    name = "", email = "", phone = "", subject = "", message = "",
    context = null,
    company_url = "",
    _formMountedAt = 0,
  } = body;

  // Soft-reject spam — 200 OK so bots think they succeeded
  if (company_url && String(company_url).trim()) {
    console.warn("[enquiry] honeypot filled — dropping silently");
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
  }
  if (_formMountedAt && Number.isFinite(Number(_formMountedAt))) {
    const elapsed = Date.now() - Number(_formMountedAt);
    if (elapsed >= 0 && elapsed < MIN_FILL_TIME_MS) {
      console.warn(`[enquiry] submitted in ${elapsed}ms — dropping silently`);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
    }
  }

  const xff = event.headers["x-forwarded-for"] || event.headers["X-Forwarded-For"] || "unknown";
  const ip  = String(xff).split(",")[0].trim();
  if (rateLimited(ip)) {
    console.warn(`[enquiry] rate-limited ip=${ip}`);
    return { statusCode: 429, headers: CORS_HEADERS, body: JSON.stringify({ error: "Too many requests. Please try again in a moment." }) };
  }

  if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing required fields." }) };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid email address." }) };
  }
  if (message.length > 5000) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Message too long." }) };
  }

  let safeContext = null;
  if (context && typeof context === "object") {
    const kind  = String(context.kind  || "").trim();
    const slug  = String(context.slug  || "").trim();
    const label = String(context.label || "").trim();
    if ((kind === "artiste" || kind === "service") &&
        /^[a-z0-9-]{1,80}$/.test(slug) &&
        label.length > 0 && label.length <= 120) {
      safeContext = {
        kind, slug,
        label:     escapeHtml(label),
        rawLabel:  label,
        kindLabel: kind === "artiste" ? "Artiste" : "Service",
      };
    }
  }

  const safe = {
    name:       escapeHtml(name.trim()),
    email:      escapeHtml(email.trim()),
    phone:      escapeHtml(phone.trim()),
    subject:    escapeHtml(subject.trim()),
    message:    escapeHtml(message.trim()).replace(/\n/g, "<br/>"),
    rawMessage: message.trim(),
    receivedAt: new Date().toUTCString(),
    context:    safeContext,
  };

  const teamSubjectPrefix = safeContext ? `[${safeContext.kindLabel} · ${safeContext.rawLabel}] ` : "[Enquiry] ";

  try {
    await sendViaResend({
      apiKey: RESEND_API_KEY,
      from: FROM, to: [TO], replyTo: email,
      subject: `${teamSubjectPrefix}${safe.subject} — ${safe.name}`,
      html: TEAM_TEMPLATE(safe),
      text:
        `New enquiry — GEMS Talent\n\n` +
        (safeContext ? `${safeContext.kindLabel}: ${safeContext.rawLabel} (${safeContext.slug})\n` : "") +
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nSubject: ${subject}\n\n${message}\n`,
    });

    await sendViaResend({
      apiKey: RESEND_API_KEY,
      from: FROM, to: [email], replyTo: REPLY_TO,
      subject: `We've received your enquiry — GEMS Talent`,
      html: AUTO_REPLY(safe),
      text:
        `Hi ${name},\n\n` +
        `Thanks for getting in touch with GEMS Talent. ` +
        `We've received your enquiry and will get back within two working days.\n\n` +
        `Subject: ${subject}\n\n${message}\n\n` +
        `— The GEMS Talent team\n${REPLY_TO}\n`,
    });

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Enquiry send failed:", err);
    return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Could not send enquiry. Please email " + REPLY_TO }) };
  }
};
