# GEMS Talent — Session handoff (May 2026, session 9)
Singapore talent agency · Desktop-first editorial prototype · React 18 + Babel CDN · Inline JSX

## What landed this session

### Phase 0.5 — CDN image localization (complete)

- `scripts/download-cdn-images.mjs` had a bug: `Array.from()` gallery arrays
  (`rwsGallery`, `chrizGallery`) generate URLs at runtime — script couldn't
  statically enumerate them, captured raw JS expressions as malformed URLs.
- Fixed: expanded both galleries to explicit static arrays in `data.js`.
  Also fixed a comment bug (`02..15` said but code generated `03..15`).
- Downloaded **32 images** (was 17 — the original count missed all gallery images)
  into `assets/cdn/`. `data.js` CDN const rewritten to `"assets/cdn"`, date
  segments stripped. Zero `gemstalent.com.sg/wordpress` refs remain.
- `assets/cdn-map.json` written (original URL → local path).
- Committed and pushed: `d7bef80`

### Open item #14 — `_redirects` file (complete)

- `_redirects` added at repo root (copied from `docs/redirects.md`).
- 9 WP page redirects + defunct paths + wp-admin catch-all.
- Committed and pushed: `f2f79f1`

### Phase 1 — Netlify staging deploy (complete)

- Site deployed at `https://gemstalent.netlify.app`.
- All 7 pages load, talent portraits render, no 404s.
- Tweaks panel confirmed unused in production (component loaded but not instantiated).

### Phase 2 — Netlify Function + form endpoint (complete)

- `netlify/functions/enquiry.js` written (Netlify handler signature).
- Upstash dropped per ADR-005 — in-memory rate limit only.
- `netlify.toml` created: publish=`.`, functions=`netlify/functions`,
  redirect `/api/enquiry` → `/.netlify/functions/enquiry`.
- `api/enquiry.js` deleted.
- `docs/EMAIL_SETUP.md` rewritten for Netlify (was Vercel-flavored).
- Env vars set in Netlify dashboard: `RESEND_API_KEY`, `ENQUIRY_TO`,
  `ENQUIRY_FROM`, `STAMP_URL`.
- Form tested end-to-end: both emails (team notification + auto-reply)
  confirmed delivered via Resend dashboard.
- Committed and pushed: `64a1b30`

### Phase 3–5 — Email migration (deferred)

- Zoho Free plan no longer available for new custom-domain signups in SG.
- Email discovered to be on **Microsoft 365** (MX → `gemstalent-com-sg.mail.protection.outlook.com`),
  NOT Exabytes mail. Exabytes is web hosting only.
- Exabytes email-only plan: SGD 324/yr — not competitive.
- Decision: defer email migration until ready to cancel Exabytes.
- Recommendation when ready: **Zoho Mail Lite** (SGD 80/yr, 4 users) or
  **Migadu** (SGD 145/yr flat unlimited users).

### Phase 6 — DNS cutover (site only, in progress)

- A record changed: `103.7.8.221` → `75.2.60.5` (Netlify load balancer).
- www CNAME changed: `gemstalent.com.sg` → `gemstalent.netlify.app`.
- MX records left untouched (Microsoft 365 email unaffected).
- Custom domains added in Netlify: `gemstalent.com.sg` + `www.gemstalent.com.sg`.
- Confirmed live on Exabytes nameservers (`ns135/136.sgcloudhosting.cloud` → `75.2.60.5`).
- Waiting for ISP/local DNS cache to clear (TTL 14400, up to 4 hours).
- **Rollback:** revert A record to `103.7.8.221`, www CNAME to `gemstalent.com.sg`.

## Discoveries this session

- **Email is on Microsoft 365**, not Exabytes. MX, autodiscover CNAME, SPF all
  point at Microsoft. Resend DKIM + send subdomain already configured in DNS.
- **Domain is registered through Exabytes** (expires 12/08/2026, auto-renew on).
  Must transfer domain before cancelling Exabytes hosting.
- **Exabytes exit plan** (when ready to cancel):
  1. Disable hosting auto-renew
  2. Migrate email (Zoho Lite or Migadu) — flip MX
  3. Transfer domain to Cloudflare Registrar (free, ~5 days, needs EPP code)
  4. Move DNS to Cloudflare (import existing records during transfer)
  5. Cancel Exabytes hosting

## What's next (Phase 7)

- Wait for `gemstalent.com.sg` to resolve to `75.2.60.5` on local DNS.
- Verify site loads at `https://gemstalent.com.sg` with valid SSL cert.
- Monitor 24–48 hrs: no bounce notifications, form still works on production URL,
  no 404s or broken images.
- Test contact form on production domain end-to-end.
- After Phase 7 stable: update `STAMP_URL` env var in Netlify from
  `gemstalent.netlify.app/...` to `gemstalent.com.sg/...`.

## File map (current state)

```
/                                Repo root
├── .gitignore
├── README.md
├── CLAUDE.md
├── data.js                      🔑 CDN now points at assets/cdn (local)
├── netlify.toml                 ✨ NEW — build config + /api/enquiry redirect
├── _redirects                   ✨ NEW — WP → React URL map
│
├── index.html
├── artistes.html
├── clients.html
├── work.html
├── services.html
├── about.html
├── contact.html
├── og-card.html
├── og-card-photo.html
├── email-preview.html
│
├── components/
│   ├── hero.jsx
│   ├── nav.jsx
│   ├── sections.jsx
│   ├── page-header.jsx
│   └── tweaks-panel.jsx
│
├── styles/
│   ├── styles.css
│   └── responsive.css
│
├── docs/
│   ├── handoff.md               THIS FILE
│   ├── DEPLOYMENT_RUNBOOK.md    8-phase plan (phases 0–2 + 6 complete)
│   ├── DECISIONS.md             12 ADRs
│   ├── ZOHO_TEAM_SETUP.md       Staff onboarding (deferred)
│   ├── redirects.md             WP → React URL map (source)
│   ├── CLAUDE_CODE_START.md     First-prompt guide
│   └── EMAIL_SETUP.md           ✨ UPDATED — Netlify-flavored
│
├── netlify/
│   └── functions/
│       └── enquiry.js           ✨ NEW — Netlify Function (replaces api/enquiry.js)
│
├── email-templates/
│   ├── team-notification.js
│   └── auto-reply.js
│
├── scripts/
│   ├── download-cdn-images.mjs
│   ├── build-og-card-photo.mjs
│   └── build-og-card-photo-canvas.recipe.js
│
├── assets/
│   ├── cdn/                     ✨ NEW — 32 localized images
│   ├── cdn-map.json             ✨ NEW — URL → local path map
│   ├── gems-stamp-nav.jpg
│   ├── gems-stamp.jpg
│   ├── og-card.png
│   └── og-card-photo.png
│
└── uploads/                     WP XML export + earlier handoffs (read-only)
```

## Open items for the next session

| # | Item | Notes |
|---|---|---|
| 1 | Replace placeholder client/testimonial copy | DDB, Edelman, Tiger Beer + testimonial quotes. `data.js → clientGroups[]` + `testimonials[]`. Deferred post-launch. |
| 6 | Distinct artiste portraits | Lawrence Wong + Theresa Carpio share image. User to provide. Deferred post-launch. |
| 7 | Real UEN | Add to `data.js.contact.uen`. Deferred post-launch. |
| 8 | Real-device QA | Test `gemstalent.com.sg` on phones once DNS resolves. |
| 16 | Update STAMP_URL env var | Change from `gemstalent.netlify.app/...` to `gemstalent.com.sg/...` after Phase 7 stable. |
| 17 | Exabytes exit (when ready) | Email migration → domain transfer → DNS to Cloudflare → cancel hosting. See "Exabytes exit plan" above. |
| 18 | Disable Exabytes hosting auto-renew | Do before next billing cycle to avoid unwanted charge. |

(Items 3, 11, 12, 14 closed this session. Items 3–5 deferred — Zoho free plan unavailable.)

## Locked design system (unchanged)

**Palette — Cool Mist + Cobalt-Led**
  Mist `#E6ECF2` · Cobalt `#0D3FA0` · Cobalt-deep `#062870` · Cobalt-soft `#2A5DC4`
  Teal `#1FA2C2` · Teal-soft `#5CC1D9`
  Brass `#C9A961` — accent only
  Clay `#D8E1ED` · Sage `#C8D4E0` — section tints · Ink `#0E1A2B`

**Type** — Inter Tight (sans, 400/500/600). Newsreader italic reserved for show/concert
title citations only (`<span className="serif-em">`).

**Eyebrow rail** — 11px tracked +0.16em, brass dot.

**Mobile breakpoints** — 1100 / 900 / 600.

**Viewport units** — `100vh` fallback, then `100dvh` (fill) or `100svh` (ceiling).

## Locked decisions (do not re-debate)

See `docs/DECISIONS.md` for full ADRs. Key locked decisions:
- Netlify Free (not Vercel — commercial ToS)
- Zoho Mail Lite when ready to migrate email (not Google, not Exabytes)
- Drop Upstash — in-memory rate limit only
- Keep Resend for branded auto-reply
- `marketing@gemstalent.com.sg` as public email
- No TypeScript / Redux / Redis / Cypress
- `data.js` single source of truth, zero build step
