import type { AdapterOutcome, EnquiryEnv, EnquiryPayload } from './types';

/**
 * Telegram — the instant team alert.
 *
 * This replaces the legacy team notification email. Once Zoho CRM holds the
 * record, that email was a third copy of the same information landing in an
 * inbox nobody files (ADR-005-amended).
 */

/** Telegram's MarkdownV2 reserves these; an unescaped one returns 400. */
function escapeMd(s: string): string {
  return s.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (c) => `\\${c}`);
}

export async function sendAlert(
  payload: EnquiryPayload,
  env: EnquiryEnv,
): Promise<AdapterOutcome> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return { ok: false, adapter: 'telegram', error: 'not configured', skipped: true };
  }

  const heading = payload.context
    ? `*New enquiry — ${escapeMd(payload.context.label)}*`
    : '*New enquiry*';

  const lines = [
    heading,
    '',
    `*From:* ${escapeMd(payload.name)}`,
    `*Email:* ${escapeMd(payload.email)}`,
    payload.phone ? `*Phone:* ${escapeMd(payload.phone)}` : null,
    `*Subject:* ${escapeMd(payload.subject)}`,
    '',
    escapeMd(payload.message.slice(0, 900)),
    payload.message.length > 900 ? escapeMd('… (truncated — full text in CRM)') : null,
  ].filter(Boolean);

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: lines.join('\n'),
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`${res.status}: ${detail.slice(0, 200)}`);
    }
    return { ok: true, adapter: 'telegram' };
  } catch (err) {
    return {
      ok: false,
      adapter: 'telegram',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
