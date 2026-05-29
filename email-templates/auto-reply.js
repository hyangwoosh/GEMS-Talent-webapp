/**
 * Auto-reply email — sent to the enquirer immediately on form submit.
 *
 * Signature: autoReply(d, opts?)
 *   d.name, d.email, d.phone, d.subject, d.message, d.receivedAt — escaped
 *   opts.voice       — "editorial" | "warm" | "crisp"   (copy tone)
 *   opts.composition — "editorial" | "minimal" | "display" (layout density + type)
 *   opts.header      — "cobalt" | "bone" | "ink"        (brand bar style)
 *
 * All opts default to "editorial"/"cobalt" — that's what api/enquiry.js gets.
 * The preview at email-preview.html lets you compare presets visually.
 */
module.exports = function autoReply(d, opts) {
  const o = Object.assign({ voice: "editorial", composition: "editorial", header: "cobalt" }, opts || {});

  // Absolute public URL for the stamp logo — required because most email
  // clients block relative paths. Set STAMP_URL in your hosting env vars
  // once the asset is uploaded.
  const STAMP = (typeof process !== "undefined" && process.env && process.env.STAMP_URL)
    || (typeof opts === "object" && opts && opts.stampUrl)
    || "https://gemstalent.com.sg/wordpress/wp-content/uploads/gems-stamp-nav.jpg";

  // Palette
  const COBALT = "#1331C2";
  const COBALT_DEEP = "#062870";
  const MIST = "#E6ECF2";
  const BONE = "#F4EFE2";
  const INK = "#0B1220";
  const MUTED = "#5C6B82";
  const BRASS = "#C9A24A";

  // ── Voice: copy strings ──────────────────────────────────────────
  const firstName = (d.name.split(" ")[0] || d.name);
  const VOICE = {
    editorial: {
      eyebrow: "Enquiry received",
      headline: `Thanks, ${firstName}. We've got it.`,
      body1: `Your enquiry has landed safely with our roster team. A member of the team will be in touch within <strong style="color:${COBALT_DEEP};">two working days</strong> — usually sooner.`,
      body2: `If your brief is time-sensitive, reply to this email and we'll prioritise it.`,
      signoff: "Warmly,",
      signature: "The GEMS Talent team",
    },
    warm: {
      eyebrow: "Lovely to hear from you",
      headline: `Hi ${firstName} — we got your note.`,
      body1: `Thanks for reaching out. One of us will be in touch within <strong style="color:${COBALT_DEEP};">two working days</strong>, often sooner. We read everything that comes through here personally.`,
      body2: `If it's urgent, just reply to this email and we'll bump it to the top of the pile.`,
      signoff: "Speak soon,",
      signature: "GEMS Talent",
    },
    crisp: {
      eyebrow: "Received",
      headline: `Enquiry logged.`,
      body1: `Your enquiry has been received. We respond within <strong style="color:${COBALT_DEEP};">two working days</strong>.`,
      body2: `Reply to this email to add anything to your brief.`,
      signoff: "—",
      signature: "GEMS Talent",
    },
  }[o.voice];

  // ── Composition: layout density + type ──────────────────────────
  const COMP = {
    editorial: {
      headlineFont: `Georgia,'Times New Roman',serif`, headlineSize: 32, headlineWeight: 500, headlineLh: 1.2,
      eyebrowSize: 11, eyebrowSpace: "0.22em", eyebrowWeight: 600,
      pageXPad: 36, heroTopPad: 44,
      cardBg: COBALT_DEEP, cardFg: "#FFFFFF", useCard: true, dividerOpacity: 0.10,
      ruleUnderHeader: true, ruleColor: BRASS, ruleHeight: 3,
    },
    minimal: {
      headlineFont: `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`, headlineSize: 26, headlineWeight: 600, headlineLh: 1.25,
      eyebrowSize: 10, eyebrowSpace: "0.18em", eyebrowWeight: 700,
      pageXPad: 28, heroTopPad: 36,
      cardBg: "transparent", cardFg: INK, useCard: false, dividerOpacity: 0.06,
      ruleUnderHeader: false, ruleColor: "transparent", ruleHeight: 0,
    },
    display: {
      headlineFont: `Georgia,'Times New Roman',serif`, headlineSize: 44, headlineWeight: 500, headlineLh: 1.08,
      eyebrowSize: 13, eyebrowSpace: "0.28em", eyebrowWeight: 600,
      pageXPad: 44, heroTopPad: 56,
      cardBg: COBALT_DEEP, cardFg: "#FFFFFF", useCard: true, dividerOpacity: 0.12,
      ruleUnderHeader: true, ruleColor: BRASS, ruleHeight: 3,
    },
  }[o.composition];

  // ── Header style ─────────────────────────────────────────────────
  const HEAD = {
    cobalt: {
      bg: COBALT_DEEP, fg: "#FFFFFF",
      wordmark: `<span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:#FFFFFF;letter-spacing:0.01em;">GEMS <span style="color:${BRASS};">Talent</span></span>`,
      align: "center", padding: "20px 28px",
    },
    bone: {
      bg: BONE, fg: INK,
      wordmark: `<span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:${INK};letter-spacing:0.01em;border-bottom:2px solid ${BRASS};padding-bottom:4px;">GEMS Talent</span>`,
      align: "center", padding: "26px 28px",
    },
    ink: {
      bg: MIST, fg: INK,
      wordmark: `<span style="display:inline-flex;align-items:center;gap:10px;"><img src="${STAMP}" alt="GEMS" width="32" height="32" style="display:block;width:32px;height:32px;border-radius:50%;"/><span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:${INK};letter-spacing:0.32em;text-transform:uppercase;">· Talent</span></span>`,
      align: "left", padding: "14px 28px",
    },
  }[o.header];

  // Helpers
  const divider = `border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});`;

  // ── Receipt block (varies with composition) ──────────────────────
  // Receipt card now sits on cobalt-deep with light text; muted labels become a soft alpha-white.
  const cardMuted = "rgba(255,255,255,0.62)";
  const cardBody  = COMP.cardFg || "#FFFFFF";

  // ── Context echo ─────────────────────────────────────────────────
  // When the enquirer arrived via a ?artiste= or ?service= deep-link,
  // mirror the slug back at them so the auto-reply confirms what they
  // actually enquired about. Brass pill matches the team-notification
  // pattern. Rendered as the first row inside the receipt block;
  // falls through to empty string when d.context is null.
  const ctxLabel = d.context
    ? (d.context.kind === "artiste" ? "Your enquiry about" : "Your brief on")
    : null;
  const contextRowCard = d.context ? `
        <tr><td style="padding:4px 24px 0;">
          <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${cardMuted};">${ctxLabel}</div>
          <div style="margin-top:8px;">
            <span style="display:inline-block;padding:5px 12px;background:${BRASS};color:${INK};font-size:13px;font-weight:600;letter-spacing:0.02em;border-radius:2px;">${d.context.label}</span>
          </div>
        </td></tr>
        <tr><td style="padding:16px 24px 0;"><div style="height:1px;background:rgba(255,255,255,0.10);"></div></td></tr>` : "";
  const contextRowInline = d.context ? `
        <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">${ctxLabel}</div>
        <div style="margin:6px 0 18px;">
          <span style="display:inline-block;padding:5px 12px;background:${BRASS};color:${INK};font-size:13px;font-weight:600;letter-spacing:0.02em;border-radius:2px;">${d.context.label}</span>
        </div>` : "";

  const receiptCard = COMP.useCard
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:${COMP.cardBg};border-radius:4px;">
        <tr><td style="padding:22px 24px 6px;">
          <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${cardMuted};font-weight:600;">For your reference</div>
        </td></tr>${contextRowCard}
        <tr><td style="padding:14px 24px 4px;">
          <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${cardMuted};">Subject</div>
          <div style="font-size:16px;color:${cardBody};margin-top:4px;font-family:Georgia,'Times New Roman',serif;">${d.subject}</div>
        </td></tr>
        <tr><td style="padding:14px 24px 22px;">
          <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${cardMuted};">Your message</div>
          <div style="font-size:14px;line-height:1.6;color:${cardBody};margin-top:6px;white-space:pre-wrap;">${d.message}</div>
        </td></tr>
      </table>`
    : `<div style="padding-top:18px;border-top:1px solid rgba(11,18,32,${COMP.dividerOpacity});">
        <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${MUTED};font-weight:600;margin-bottom:14px;">For your reference</div>
        ${contextRowInline}
        <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">Subject</div>
        <div style="font-size:16px;color:${INK};margin:4px 0 16px;font-family:Georgia,'Times New Roman',serif;">${d.subject}</div>
        <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">Your message</div>
        <div style="font-size:14px;line-height:1.6;color:${INK};margin-top:6px;white-space:pre-wrap;">${d.message}</div>
      </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>We've received your enquiry — GEMS Talent</title>
</head>
<body style="margin:0;padding:0;background:${MIST};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:4px;overflow:hidden;border:1px solid rgba(11,18,32,0.08);">

        <!-- Brand bar -->
        <tr><td style="background:${HEAD.bg};padding:${HEAD.padding};text-align:${HEAD.align};">
          ${HEAD.wordmark}
        </td></tr>
        ${COMP.ruleUnderHeader ? `<tr><td style="height:${COMP.ruleHeight}px;background:${COMP.ruleColor};line-height:${COMP.ruleHeight}px;font-size:0;">&nbsp;</td></tr>` : ""}

        <!-- Hero -->
        <tr><td style="padding:${COMP.heroTopPad}px ${COMP.pageXPad}px 12px;">
          <div style="font-size:${COMP.eyebrowSize}px;letter-spacing:${COMP.eyebrowSpace};text-transform:uppercase;color:${COBALT};font-weight:${COMP.eyebrowWeight};">
            ${VOICE.eyebrow}
          </div>
          <h1 style="margin:14px 0 0;font-family:${COMP.headlineFont};font-size:${COMP.headlineSize}px;line-height:${COMP.headlineLh};font-weight:${COMP.headlineWeight};color:${INK};letter-spacing:-0.005em;">
            ${VOICE.headline}
          </h1>
        </td></tr>

        <!-- Body copy -->
        <tr><td style="padding:18px ${COMP.pageXPad}px 8px;font-size:16px;line-height:1.65;color:${INK};">
          <p style="margin:0 0 16px;">${VOICE.body1}</p>
          <p style="margin:0 0 8px;color:${MUTED};font-size:14px;">${VOICE.body2}</p>
        </td></tr>

        <!-- Receipt block -->
        <tr><td style="padding:24px ${COMP.pageXPad}px 8px;">${receiptCard}</td></tr>

        <!-- Signature -->
        <tr><td style="padding:28px ${COMP.pageXPad}px 8px;font-size:15px;line-height:1.6;color:${INK};">
          <p style="margin:0;">${VOICE.signoff}</p>
          <p style="margin:4px 0 0;font-family:${COMP.headlineFont};font-size:18px;">${VOICE.signature}</p>
        </td></tr>

        <!-- Divider rule -->
        <tr><td style="padding:24px ${COMP.pageXPad}px 0;">
          <div style="height:1px;background:rgba(11,18,32,${COMP.dividerOpacity});"></div>
        </td></tr>

        <!-- Studio block -->
        <tr><td style="padding:20px ${COMP.pageXPad}px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};width:50%;">
                Studio
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:${INK};text-transform:none;letter-spacing:0;margin-top:6px;line-height:1.5;">
                  192 Waterloo Street #07-07<br/>Skyline Building, Singapore 187966
                </div>
              </td>
              <td valign="top" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};width:50%;">
                Reach
                <div style="font-size:14px;margin-top:6px;line-height:1.7;text-transform:none;letter-spacing:0;">
                  <a href="mailto:hello@gemstalent.com.sg" style="color:${COBALT};text-decoration:none;">hello@gemstalent.com.sg</a><br/>
                  <span style="color:${INK};">+65 9685 5855</span>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer strip -->
        <tr><td style="background:${MIST};padding:14px ${COMP.pageXPad}px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">
          GEMS Talent — Singapore × Asia
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};
