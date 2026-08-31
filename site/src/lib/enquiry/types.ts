/** Shared types for the enquiry pipeline. */

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  /** Set when the enquiry came from a specific artiste or service page. */
  context: EnquiryContext | null;
  receivedAt: string;
}

export interface EnquiryContext {
  kind: 'artiste' | 'service';
  slug: string;
  label: string;
  kindLabel: 'Artiste' | 'Service';
}

/**
 * Secrets, read from the Cloudflare Worker binding at runtime.
 *
 * None of these have defaults. The legacy function defaulted ENQUIRY_TO to
 * `talent@gems.sg` — a domain GEMS does not control — so an unset variable
 * silently routed enquiries into the void. An adapter here is skipped when
 * its config is absent, and the skip is reported.
 */
export interface EnquiryEnv {
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  RESEND_API_KEY?: string;
  ENQUIRY_FROM?: string;
  ENQUIRY_REPLY_TO?: string;
  STAMP_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export type AdapterOutcome =
  | { ok: true; adapter: string; detail?: string }
  | { ok: false; adapter: string; error: string; skipped?: boolean };
