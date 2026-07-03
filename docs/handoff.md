# GEMS Talent — Session handoff (July 2026, session 13)
Singapore talent agency · Desktop-first editorial prototype · React 18 + Babel CDN · Inline JSX

---

## State of the world right now

**Site is LIVE at `https://gemstalent.com.sg`** — React site on Netlify.
- Netlify hosting, auto-deploys from GitHub `main`.
- SSL cert provisioned. All 7 pages load, talent portraits render, contact form works end-to-end.
- DNS managed by **Cloudflare** (free plan) — active and verified.

**Email is on Zoho Mail Free** — migrated from Microsoft 365.
- 3 mailboxes: `christina@`, `marketing@`, `terence.tan@gemstalent.com.sg`
- MX → `mx.zoho.com` / `mx2.zoho.com` / `mx3.zoho.com`
- SPF → `v=spf1 include:zohomail.com ~all`
- DKIM → `zmail._domainkey` configured
- DMARC → `v=DMARC1; p=none;`
- Zoho verification TXT in place.

**Microsoft 365** — set to cancel on renewal. Zoho handling all mail now.

**Resend transactional email** — working. `send.gemstalent.com.sg` subdomain configured (MX + SPF + DKIM for Resend/SES).

**Cloudflare DNS** — active. Nameservers changed and verified.
- Nameservers: `kanye.ns.cloudflare.com`, `romina.ns.cloudflare.com`
- Old nameservers (rollback): `ns135.sgcloudhosting.cloud`, `ns136.sgcloudhosting.cloud`

**Exabytes:** hosting CANCELLED (session 13). Domain registration stays at Exabytes — registrar decision made, no transfer to Vodien. Domain expires 12/08/2026, renews at paid rate. `.com.sg` TLD not transferable to Cloudflare Registrar.

---

## What landed this session (session 13)

### Exabytes exit complete ✓
- Hosting cancelled (user emailed billing). Domain stays at Exabytes — registrar decision final.
- Post-cancellation DNS verification: all records intact on Cloudflare (NS, A, www CNAME, Zoho MX/SPF/DKIM/DMARC, Resend send subdomain MX/SPF, Zoho verify TXT). Apex + www serve 200 via Netlify. Extensionless URLs resolve.

### SEO + hardening (no-content-needed polish) ✓
- `sitemap.xml` — 7 canonical extensionless URLs.
- `robots.txt` — sitemap ref; disallows og-card/og-card-photo/email-preview + /wordpress/.
- `404.html` — branded static page (palette tokens, eyebrow rail, ArrowRight CTA, noindex). Netlify picks it up automatically from publish root.
- `netlify.toml` — security headers for all paths: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo off). CSP deliberately skipped — Babel-in-browser needs inline/eval, strict CSP would break the site.

---

## What landed in session 12

### Cloudflare DNS setup ✓
- Domain `gemstalent.com.sg` added to Cloudflare (free plan).
- DNS records auto-imported and cross-checked against Exabytes cPanel.
- Cleaned up 11 junk records (7 cPanel A records, autodiscover CNAME, 3 obsolete TXT records).
- Remaining records set to **DNS only** (no Cloudflare proxy — Netlify handles SSL/CDN).
- Nameservers changed at Exabytes → Cloudflare. Activated and verified.

### Post-activation verification ✓
- Site loads on `gemstalent.com.sg`.
- Contact form sends enquiry + auto-reply emails.
- Zoho email receive + reply working.

### Security audit of contact form ✓
- Reviewed `netlify/functions/enquiry.js` and `contact.html`.
- All inputs HTML-escaped server-side (XSS prevention).
- Email regex validation, required field checks, message length cap (5000 chars).
- Honeypot field + timing-based bot detection + IP rate limiting (3/min, 10/hr).
- No database, no auth, no file uploads — minimal attack surface.

---

## What landed in prior sessions (10–11, including crashed session)

### Zoho Mail Free setup ✓ (was Phase 3)
- Zoho Mail Free tier accepted for `gemstalent.com.sg` (grandfathered/region exception — docs said unavailable in SG).
- Domain verified in Zoho. 3 mailboxes created: `christina@`, `marketing@`, `terence.tan@`.
- MX, SPF, DKIM, DMARC records all configured at Exabytes DNS (now mirrored in Cloudflare).

### M365 cancellation initiated ✓ (was Phase 8 prereq)
- M365 set to cancel on renewal via mobile. Will stop at end of current billing period.
- No disruption — Zoho already handling all mail delivery.

### STAMP_URL env var updated ✓ (was open item #2)
- Changed from `gemstalent.netlify.app` to `gemstalent.com.sg` in Netlify dashboard. Redeployed.

### Phase 7 monitoring passed ✓
- All 7 pages load on production domain.
- Contact form tested on `gemstalent.com.sg/contact`.
- Netlify function logs clean.

---

## First things to do next session

1. **Content polish** (needs input from user) — replace placeholder client/testimonial copy, get distinct artiste portraits, add real UEN to `data.js`.

2. **Verify deployed polish** — after Netlify deploy: `robots.txt` + `sitemap.xml` serve 200, broken URL shows branded 404, response headers include X-Frame-Options. Optionally submit sitemap in Google Search Console.

3. **Domain renewal reminder** — Exabytes invoice due 12/08/2026 (domain only now).

---

## Exabytes exit plan — COMPLETE

1. ~~Migrate email~~ ✓ — Zoho Mail Free
2. ~~Move DNS to Cloudflare~~ ✓ — active and verified
3. ~~M365 cancellation~~ ✓ — set to cancel on renewal
4. ~~Cancel hosting~~ ✓ — cancelled session 13
5. ~~Domain registrar decision~~ ✓ — stays at Exabytes (renewal due 12/08/2026)

---

## Open items

| # | Item | Priority | Notes |
|---|---|---|---|
| 1 | ~~Cancel Exabytes hosting~~ | DONE | Cancelled session 13 |
| 2 | ~~Domain registrar decision~~ | DONE | Stays at Exabytes, renews 12/08/2026 |
| 3 | Cancel M365 | Done — pending | Set to cancel on renewal, no action needed |
| 4 | Replace placeholder client/testimonial copy | Medium — needs user input | data.js → clientGroups[], testimonials[] |
| 5 | Distinct artiste portraits | Medium — needs user input | Lawrence Wong + Theresa Carpio share image |
| 6 | Real UEN | Medium — needs user input | Add to data.js.contact.uen |
| 7 | Verify deployed SEO/404/headers | Low | After next deploy — see "First things" §2 |
| 8 | Real-device QA responsive | Low | Test on phones |
| 9 | Google Search Console + sitemap submit | Low | Optional discoverability boost |

---

## Infrastructure map

| Service | Provider | Plan | Cost | Status |
|---|---|---|---|---|
| Web hosting | Netlify | Free | $0 | Active |
| DNS | Cloudflare | Free | $0 | Active |
| Email (mailboxes) | Zoho Mail | Free (5 users) | $0 | Active |
| Transactional email | Resend | Free tier | $0 | Active |
| Domain registration | Exabytes | Domain only | Paid renewal, due 12/08/2026 | Active |
| Old hosting | Exabytes | cPanel 13 Plus | — | CANCELLED |
| Old email | Microsoft 365 | Business Basic | ~$6.30 USD/mo | Cancelling on renewal |

**Monthly cost:** $0 (domain renewal annually)

---

## File map (current state)

```
/                                Repo root
├── .gitignore
├── README.md
├── CLAUDE.md
├── data.js                      CDN → assets/cdn (local, 32 images)
├── netlify.toml                 Build config + /api/enquiry redirect + security headers
├── _redirects                   WP → React URL map (17 rules)
├── sitemap.xml                  7 canonical URLs
├── robots.txt                   Sitemap ref + utility-page disallows
│
├── index.html · artistes.html · clients.html · work.html
├── services.html · about.html · contact.html
├── og-card.html · og-card-photo.html · email-preview.html
├── 404.html                     Branded static 404 (Netlify auto-serves)
│
├── components/
│   ├── hero.jsx · nav.jsx · sections.jsx
│   ├── page-header.jsx · tweaks-panel.jsx
│
├── styles/
│   ├── styles.css · responsive.css
│
├── docs/
│   ├── handoff.md               THIS FILE
│   ├── DEPLOYMENT_RUNBOOK.md    8-phase plan (phases 0–7 complete, phase 8 in progress)
│   ├── DECISIONS.md             14 ADRs
│   ├── ZOHO_TEAM_SETUP.md       Staff onboarding
│   ├── redirects.md             WP → React URL map (source for _redirects)
│   ├── CLAUDE_CODE_START.md     First-prompt guide
│   ├── EMAIL_SETUP.md           Netlify-flavored
│   └── USER_MIGRATION_GUIDE.md  Human-facing deploy guide
│
├── netlify/
│   └── functions/
│       └── enquiry.js           Netlify Function (Resend + in-memory rate limit)
│
├── email-templates/
│   ├── team-notification.js · auto-reply.js
│
├── scripts/
│   ├── download-cdn-images.mjs
│   ├── build-og-card-photo.mjs
│   └── build-og-card-photo-canvas.recipe.js
│
├── assets/
│   ├── cdn/                     32 localized images
│   ├── cdn-map.json             Original URL → local path map
│   ├── gems-stamp-nav.jpg · gems-stamp.jpg
│   └── og-card.png · og-card-photo.png
│
└── uploads/                     WP XML export + earlier handoffs (read-only)
```

---

## Locked design system (unchanged — do not modify)

**Palette — Cool Mist + Cobalt-Led**
Mist `#E6ECF2` · Cobalt `#0D3FA0` · Cobalt-deep `#062870` · Cobalt-soft `#2A5DC4`
Teal `#1FA2C2` · Teal-soft `#5CC1D9` · Brass `#C9A961` (accent only)
Clay `#D8E1ED` · Sage `#C8D4E0` (section tints) · Ink `#0E1A2B`

**Type** — Inter Tight 400/500/600. Newsreader italic for show title citations only.
JetBrains Mono for eyebrow rails + numerals.

**Breakpoints** — 1100 / 900 / 600. Hamburger ≤900. Tap targets ≥44px.

**Viewport units** — `100vh` fallback first, then `100dvh` (fill) or `100svh` (ceiling).

---

## Locked decisions (do not re-debate — see docs/DECISIONS.md for full ADRs)

- Netlify Free (not Vercel — commercial ToS issue)
- Zoho Mail Free for email (grandfathered signup worked)
- Upstash dropped — in-memory rate limit only (ADR-005)
- Resend for branded auto-reply (not Formspree)
- `marketing@gemstalent.com.sg` as public-facing email
- No TypeScript / Redux / Redis / Cypress
- `data.js` single source of truth, zero build step
- Gallery arrays must be static (not Array.from) — ADR-013
- Exabytes exit order: email → DNS → cancel hosting → domain decision (ADR-014, updated)
- Cloudflare for DNS (free plan, DNS only mode — no proxy)
- `.com.sg` stays at Exabytes or Vodien — Cloudflare Registrar doesn't support TLD

---

## DNS records (Cloudflare — clean set)

| Type | Name | Content | Notes |
|---|---|---|---|
| A | `gemstalent.com.sg` | `75.2.60.5` | Netlify (DNS only) |
| CNAME | `www` | `gemstalent.netlify.app` | Netlify (DNS only) |
| CNAME | `mail` | `gemstalent.com.sg` | Legacy (DNS only) |
| MX | root | `mx.zoho.com` [10] | Zoho |
| MX | root | `mx2.zoho.com` [20] | Zoho |
| MX | root | `mx3.zoho.com` [50] | Zoho |
| MX | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` [10] | Resend |
| TXT | root | `v=spf1 include:zohomail.com ~all` | SPF |
| TXT | root | `zoho-verification=zb393...` | Zoho domain verify |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC |
| TXT | `default._domainkey` | Resend DKIM key | Resend |
| TXT | `resend._domainkey` | Resend DKIM key | Resend |
| TXT | `zmail._domainkey` | Zoho DKIM key | Zoho |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Resend SPF |
