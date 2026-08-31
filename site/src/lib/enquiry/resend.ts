import type { AdapterOutcome, EnquiryEnv, EnquiryPayload } from './types';

/**
 * Resend — the branded auto-reply to the enquirer, and nothing else.
 *
 * This is the one job in the pipeline nothing else in the stack can do:
 * Cloudflare Email Routing is inbound-forwarding only, Zoho CRM Free excludes
 * workflow automation, and sending programmatically from a staff mailbox risks
 * that mailbox's reputation. The team notification email it used to also send
 * is gone — Telegram and the CRM record cover that (ADR-005-amended).
 */

const RESEND_URL = 'https://api.resend.com/emails';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function autoReplyHtml(payload: EnquiryPayload, stampUrl: string | undefined): string {
  const safeName = escapeHtml(payload.name);
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, '<br />');

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#E6ECF2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E6ECF2;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0"
             style="background:#FFFFFF;border:1px solid #C3D0DE;">
        <tr><td style="padding:32px 36px 0;">
          ${stampUrl ? `<img src="${escapeHtml(stampUrl)}" alt="GEMS Talent" width="44" height="44" style="display:block;border:0;" />` : ''}
        </td></tr>
        <tr><td style="padding:22px 36px 0;font:600 21px/1.25 'Inter Tight',Helvetica,Arial,sans-serif;color:#0E1A2B;letter-spacing:-.01em;">
          We've received your enquiry
        </td></tr>
        <tr><td style="padding:14px 36px 0;font:400 15px/1.6 Helvetica,Arial,sans-serif;color:#3D4C60;">
          Hi ${safeName},<br /><br />
          Thanks for getting in touch with GEMS Talent. We've got your enquiry and
          will come back to you within two working days.
        </td></tr>
        <tr><td style="padding:24px 36px 0;">
          <div style="border-top:1px solid #C3D0DE;padding-top:16px;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#6B7B90;">
            <strong style="color:#0E1A2B;">Subject</strong><br />${safeSubject}
          </div>
        </td></tr>
        <tr><td style="padding:14px 36px 30px;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:#3D4C60;">
          ${safeMessage}
        </td></tr>
        <tr><td style="padding:0 36px 32px;font:400 12px/1.5 Helvetica,Arial,sans-serif;color:#6B7B90;">
          GEMS Talent · Singapore
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendAutoReply(
  payload: EnquiryPayload,
  env: EnquiryEnv,
): Promise<AdapterOutcome> {
  if (!env.RESEND_API_KEY || !env.ENQUIRY_FROM) {
    return { ok: false, adapter: 'resend', error: 'not configured', skipped: true };
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM,
        to: [payload.email],
        reply_to: env.ENQUIRY_REPLY_TO || undefined,
        subject: "We've received your enquiry — GEMS Talent",
        html: autoReplyHtml(payload, env.STAMP_URL),
        text:
          `Hi ${payload.name},\n\n` +
          `Thanks for getting in touch with GEMS Talent. We've got your enquiry and ` +
          `will come back to you within two working days.\n\n` +
          `Subject: ${payload.subject}\n\n${payload.message}\n\n` +
          `— GEMS Talent, Singapore\n`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`${res.status}: ${detail.slice(0, 200)}`);
    }
    return { ok: true, adapter: 'resend' };
  } catch (err) {
    return { ok: false, adapter: 'resend', error: err instanceof Error ? err.message : String(err) };
  }
}
