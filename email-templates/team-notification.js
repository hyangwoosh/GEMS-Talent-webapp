/**
 * Team notification email — sent to talent@gems.sg on every enquiry.
 *
 * Signature: teamNotification(d, opts?)
 *   opts.voice       — "editorial" | "warm" | "crisp"   (subject line + CTA label)
 *   opts.composition — "editorial" | "minimal" | "display"
 *   opts.header      — "cobalt" | "bone" | "ink"
 *
 * Renders cleanly in Gmail / Apple Mail / Outlook (inline styles, table layout).
 */
module.exports = function teamNotification(d, opts) {
  const o = Object.assign({ voice: "editorial", composition: "editorial", header: "cobalt" }, opts || {});

  // Absolute public URL for the stamp logo — required because most email
  // clients block relative paths. Set STAMP_URL in your hosting env vars
  // once the asset is uploaded. The default points at gemstalent.com.sg,
  // which is where the rest of the site's image assets are served from.
  const STAMP = (typeof process !== "undefined" && process.env && process.env.STAMP_URL)
    || (typeof opts === "object" && opts && opts.stampUrl)
    || "https://gemstalent.com.sg/wordpress/wp-content/uploads/gems-stamp-nav.jpg";

  const COBALT = "#1331C2";
  const COBALT_DEEP = "#062870";
  const MIST = "#E6ECF2";
  const BONE = "#F4EFE2";
  const INK = "#0B1220";
  const MUTED = "#5C6B82";
  const BRASS = "#C9A24A";

  // ── Voice: just the CTA label + ribbon tag ───────────────────────
  const VOICE = {
    editorial: { ribbon: "New enquiry",      cta: `Reply to ${d.name} →` },
    warm:      { ribbon: "Someone wrote in", cta: `Write back to ${d.name}` },
    crisp:     { ribbon: "Enquiry · log",    cta: `Reply →` },
  }[o.voice];

  // ── Composition ──────────────────────────────────────────────────
  const COMP = {
    editorial: {
      headlineFont: `Georgia,'Times New Roman',serif`,
      headlineSize: 24, headlineWeight: 500, headlineLh: 1.25,
      pageXPad: 28, heroTopPad: 32,
      tableRowGap: 14, dividerOpacity: 0.06,
      ctaRadius: 2,
      ruleUnderHeader: true,
    },
    minimal: {
      headlineFont: `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`,
      headlineSize: 20, headlineWeight: 600, headlineLh: 1.3,
      pageXPad: 24, heroTopPad: 28,
      tableRowGap: 10, dividerOpacity: 0.04,
      ctaRadius: 1,
      ruleUnderHeader: false,
    },
    display: {
      headlineFont: `Georgia,'Times New Roman',serif`,
      headlineSize: 32, headlineWeight: 500, headlineLh: 1.15,
      pageXPad: 36, heroTopPad: 40,
      tableRowGap: 16, dividerOpacity: 0.10,
      ctaRadius: 0,
      ruleUnderHeader: true,
    },
  }[o.composition];

  // ── Header style ─────────────────────────────────────────────────
  const HEAD = {
    cobalt: {
      bg: COBALT_DEEP, fg: "#FFFFFF",
      wordmark: `<span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:600;color:#FFFFFF;letter-spacing:0.01em;">GEMS <span style="color:${BRASS};">Talent</span></span>`,
      ribbonColor: "rgba(255,255,255,0.7)",
    },
    bone: {
      bg: BONE, fg: INK,
      wordmark: `<span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:600;color:${INK};letter-spacing:0.01em;border-bottom:2px solid ${BRASS};padding-bottom:3px;">GEMS Talent</span>`,
      ribbonColor: MUTED,
    },
    ink: {
      bg: MIST, fg: INK,
      wordmark: `<span style="display:inline-flex;align-items:center;gap:10px;"><img src="${STAMP}" alt="GEMS" width="32" height="32" style="display:block;width:32px;height:32px;border-radius:50%;"/><span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:${INK};letter-spacing:0.32em;text-transform:uppercase;">· Talent</span></span>`,
      ribbonColor: MUTED,
    },
  }[o.header];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>New enquiry — GEMS Talent</title>
</head>
<body style="margin:0;padding:0;background:${MIST};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid rgba(11,18,32,0.08);border-radius:4px;overflow:hidden;">

        <!-- Header bar -->
        <tr><td style="background:${HEAD.bg};padding:20px ${COMP.pageXPad}px;">
          <table width="100%"><tr>
            <td>${HEAD.wordmark}</td>
            <td align="right" style="font-size:11px;color:${HEAD.ribbonColor};letter-spacing:0.14em;text-transform:uppercase;">
              ${VOICE.ribbon}
            </td>
          </tr></table>
        </td></tr>
        ${COMP.ruleUnderHeader ? `<tr><td style="height:3px;background:${BRASS};line-height:3px;font-size:0;">&nbsp;</td></tr>` : ""}

        <!-- Eyebrow + headline -->
        <tr><td style="padding:${COMP.heroTopPad}px ${COMP.pageXPad}px 8px;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">Received ${d.receivedAt}</div>
          <h1 style="margin:8px 0 0;font-family:${COMP.headlineFont};font-size:${COMP.headlineSize}px;line-height:${COMP.headlineLh};font-weight:${COMP.headlineWeight};color:${INK};">
            ${d.subject}
          </h1>
        </td></tr>

        <!-- Sender details table -->
        <tr><td style="padding:24px ${COMP.pageXPad}px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(11,18,32,${COMP.dividerOpacity * 2});">
            ${d.context ? `<tr>
              <td style="padding:${COMP.tableRowGap}px 0;width:120px;font-size:12px;color:${MUTED};letter-spacing:0.04em;text-transform:uppercase;border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">${d.context.kindLabel}</td>
              <td style="padding:${COMP.tableRowGap}px 0;font-size:15px;color:${INK};border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">
                <span style="display:inline-block;padding:3px 10px;background:${BRASS};color:${INK};font-size:12px;font-weight:600;letter-spacing:0.04em;border-radius:2px;">${d.context.label}</span>
                <span style="margin-left:10px;color:${MUTED};font-family:Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.04em;">${d.context.slug}</span>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:${COMP.tableRowGap}px 0;width:120px;font-size:12px;color:${MUTED};letter-spacing:0.04em;text-transform:uppercase;border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">From</td>
              <td style="padding:${COMP.tableRowGap}px 0;font-size:15px;color:${INK};border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">${d.name}</td>
            </tr>
            <tr>
              <td style="padding:${COMP.tableRowGap}px 0;font-size:12px;color:${MUTED};letter-spacing:0.04em;text-transform:uppercase;border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">Email</td>
              <td style="padding:${COMP.tableRowGap}px 0;font-size:15px;border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">
                <a href="mailto:${d.email}" style="color:${COBALT};text-decoration:none;">${d.email}</a>
              </td>
            </tr>
            ${d.phone ? `<tr>
              <td style="padding:${COMP.tableRowGap}px 0;font-size:12px;color:${MUTED};letter-spacing:0.04em;text-transform:uppercase;border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">Phone</td>
              <td style="padding:${COMP.tableRowGap}px 0;font-size:15px;color:${INK};border-bottom:1px solid rgba(11,18,32,${COMP.dividerOpacity});">${d.phone}</td>
            </tr>` : ""}
          </table>
        </td></tr>

        <!-- Message body -->
        <tr><td style="padding:8px ${COMP.pageXPad}px 28px;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};margin:18px 0 10px;">Message</div>
          <div style="font-size:15px;line-height:1.65;color:${INK};white-space:pre-wrap;">${d.message}</div>
        </td></tr>

        <!-- Reply CTA -->
        <tr><td style="padding:0 ${COMP.pageXPad}px 32px;">
          <table cellpadding="0" cellspacing="0"><tr><td style="background:${COBALT};border-radius:${COMP.ctaRadius}px;">
            <a href="mailto:${d.email}?subject=Re:%20${encodeURIComponent(d.subject)}"
               style="display:inline-block;padding:14px 22px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;font-weight:600;">
              ${VOICE.cta}
            </a>
          </td></tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:${MIST};padding:16px ${COMP.pageXPad}px;font-size:11px;color:${MUTED};letter-spacing:0.06em;">
          Sent from the gemstalent.com.sg enquiry form
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};
