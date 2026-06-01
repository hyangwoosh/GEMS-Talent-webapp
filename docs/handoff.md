# GEMS Talent — Session handoff (May 2026, session 9)
Singapore talent agency · Desktop-first editorial prototype · React 18 + Babel CDN · Inline JSX

---

## State of the world right now

**Site is LIVE at `https://gemstalent.com.sg`** — new React site, not WordPress.
- Netlify hosting, auto-deploys from GitHub `main`.
- SSL cert provisioned (white lock = secure, confirmed on phone).
- All 7 pages load, talent portraits render, contact form works end-to-end.
- DNS propagated on mobile/external networks. PC still showing old cached IP (router cache, resolves itself — not a problem).

**Email is on Microsoft 365** — confirmed active, SGD ~$6.30 USD/month, 3 mailboxes.
- MX → `gemstalent-com-sg.mail.protection.outlook.com`
- SPF → `include:spf.protection.outlook.com`
- autodiscover CNAME → `autodiscover.outlook.com`
- **Confirmed mailboxes:** `christina@`, `marketing@`, `terence.tan@gemstalent.com.sg`
- `jojo@` and `shinethw@` do NOT exist on this subscription.
- Phases 3–5 (email migration) retired — email is already handled.

**Exabytes hosting:** active, next due 12/08/2026, billing SGD 626.60 triennially (cPanel 13 Plus). Domain also registered through Exabytes.

---

## What landed this session (in order)

### Phase 0 — Repo gate
Clean. Remote confirmed at `github.com:hyangwoosh/GEMS-Talent-webapp`.

### Phase 0.5 — CDN image localization ✓
- Found bug: `rwsGallery` and `chrizGallery` used `Array.from()` — script couldn't statically enumerate gallery URLs, captured raw JS expressions as malformed URLs.
- Fixed: expanded both to explicit static arrays in `data.js`. Also fixed comment bug (`02..15` said, `03..15` actual — no `-02.jpg` file exists on WP).
- Downloaded **32 images** into `assets/cdn/` (original estimate was 17 — missed all gallery images).
- `data.js` CDN const rewritten to `"assets/cdn"`, date segments stripped. Zero WP refs remain.
- `assets/cdn-map.json` written.
- Committed: `d7bef80`

### Open item #14 — `_redirects` ✓
- `_redirects` file created at repo root from `docs/redirects.md`.
- Committed: `f2f79f1`

### Phase 1 — Netlify staging deploy ✓
- Site deployed at `https://gemstalent.netlify.app`.
- All acceptance criteria passed: 7 pages, portraits, no 404s.
- Site renamed to `gemstalent` in Netlify (Project configuration → Change project name).

### Phase 2 — Netlify Function ✓
- `netlify/functions/enquiry.js` written (Netlify handler, in-memory rate limit, Upstash dropped per ADR-005).
- `netlify.toml`: publish=`.`, functions=`netlify/functions`, redirect `/api/enquiry` → `/.netlify/functions/enquiry`.
- `api/enquiry.js` deleted.
- `docs/EMAIL_SETUP.md` rewritten for Netlify.
- Env vars set in Netlify: `RESEND_API_KEY`, `ENQUIRY_TO` (terence.tan@gemstalent.com.sg), `ENQUIRY_FROM`, `STAMP_URL` (gemstalent.netlify.app — needs update post-cutover).
- Form tested: both emails confirmed in Resend dashboard (team notification + auto-reply).
- Committed: `64a1b30`

### Phases 3–5 — Email migration (deferred — situation changed)
- Zoho Free no longer available for new custom-domain signups in SG.
- Discovered email is already on **Microsoft 365**, not Exabytes.
- M365 subscription exists but admin credentials unknown — need Terence to identify.
- If M365 is confirmed active: no email migration needed at all. Phases 3–5 retired.
- If M365 turns out to be broken/expired: migrate to Zoho Mail Lite (SGD 80/yr, 4 users).

### Phase 6 — DNS cutover (site only) ✓
- A record: `103.7.8.221` → `75.2.60.5` (Netlify).
- www CNAME: `gemstalent.com.sg` → `gemstalent.netlify.app`.
- MX untouched (Microsoft 365 email unaffected).
- Custom domains added in Netlify dashboard.
- Confirmed live on Exabytes nameservers (`ns135/136.sgcloudhosting.cloud`).
- Site confirmed loading on phone + mobile network.
- **Rollback if needed:** revert A → `103.7.8.221`, www CNAME → `gemstalent.com.sg`.

---

## First things to do next session

1. ~~**Confirm M365 status**~~ ✓ **Done** — M365 active, 3 mailboxes confirmed (`christina@`, `marketing@`, `terence.tan@`). Phases 3–5 retired.

2. **Update `STAMP_URL` env var in Netlify** — change from `https://gemstalent.netlify.app/assets/gems-stamp-nav.jpg` to `https://gemstalent.com.sg/assets/gems-stamp-nav.jpg`. Trigger redeploy. (Open item #16)

3. **Phase 7 verification** (24–48 hr monitor):
   - [ ] `https://gemstalent.com.sg` loads correctly on desktop (PC DNS cache should clear)
   - [ ] All 7 pages work
   - [ ] Contact form tested on production domain (`gemstalent.com.sg/contact`)
   - [ ] No bounce notifications in M365 mailboxes
   - [ ] Netlify function logs clean (Logs & metrics → Functions → enquiry)

4. **Disable Exabytes hosting auto-renew** — client area → My Services → hosting plan → Request Cancellation (this is how Exabytes stops auto-renew; next due 12/08/2026 so not urgent but do it before forgetting).

---

## Exabytes exit plan (when ready — not urgent until mid-2026)

**Prerequisites before cancelling hosting:**
1. Confirm M365 situation (step 1 above)
2. Migrate email if M365 is broken (Zoho Lite or Migadu)
3. Transfer domain from Exabytes → Cloudflare Registrar (free, ~5 days, need EPP/auth code from Exabytes)
4. Move DNS to Cloudflare (import all Zone Editor records during transfer)
5. Cancel Exabytes hosting only after domain transfer confirmed + DNS stable

**Key facts:**
- Domain registered through Exabytes, expires 12/08/2026 — must transfer before cancelling hosting
- Exabytes email-only plan: SGD 324/yr — not worth it vs Zoho Lite SGD 80/yr
- cPanel email accounts on Exabytes go unused (MX routes to M365, not cPanel)

---

## Open items

| # | Item | Priority | Notes |
|---|---|---|---|
| 1 | ~~Confirm M365 subscription status~~ | ~~HIGH~~ DONE | Active, $6.30 USD/mth, 3 mailboxes confirmed |
| 2 | Update STAMP_URL env var in Netlify | High | Change to gemstalent.com.sg domain |
| 3 | Phase 7 monitoring | High | 24–48 hr verify post-cutover |
| 4 | Disable Exabytes hosting auto-renew | Medium | Before 12/08/2026 |
| 5 | Replace placeholder client/testimonial copy | Low — post-launch | data.js → clientGroups[], testimonials[] |
| 6 | Distinct artiste portraits | Low — post-launch | Lawrence Wong + Theresa Carpio share image |
| 7 | Real UEN | Low — post-launch | Add to data.js.contact.uen |
| 8 | Real-device QA responsive | Low | Test on phones once PC DNS clears |
| 9 | Exabytes full exit | When ready | See exit plan above |

---

## File map (current state)

```
/                                Repo root
├── .gitignore
├── README.md
├── CLAUDE.md
├── data.js                      CDN → assets/cdn (local, 32 images)
├── netlify.toml                 Build config + /api/enquiry redirect
├── _redirects                   WP → React URL map (17 rules)
│
├── index.html · artistes.html · clients.html · work.html
├── services.html · about.html · contact.html
├── og-card.html · og-card-photo.html · email-preview.html
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
│   ├── DEPLOYMENT_RUNBOOK.md    8-phase plan (phases 0–2 + 6 complete)
│   ├── DECISIONS.md             14 ADRs (ADR-013 gallery arrays, ADR-014 Exabytes exit)
│   ├── ZOHO_TEAM_SETUP.md       Staff onboarding (deferred — M365 may make this moot)
│   ├── redirects.md             WP → React URL map (source for _redirects)
│   ├── CLAUDE_CODE_START.md     First-prompt guide
│   └── EMAIL_SETUP.md           Netlify-flavored (updated this session)
│
├── netlify/
│   └── functions/
│       └── enquiry.js           Netlify Function (replaces deleted api/enquiry.js)
│
├── email-templates/
│   ├── team-notification.js · auto-reply.js
│
├── scripts/
│   ├── download-cdn-images.mjs  (run complete — do not re-run unless images change)
│   ├── build-og-card-photo.mjs
│   └── build-og-card-photo-canvas.recipe.js
│
├── assets/
│   ├── cdn/                     32 localized images (all gallery + portrait + bg)
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
- Zoho Mail Lite if email migration needed (not Google, not Exabytes)
- Upstash dropped — in-memory rate limit only (ADR-005)
- Resend for branded auto-reply (not Formspree)
- `marketing@gemstalent.com.sg` as public-facing email
- No TypeScript / Redux / Redis / Cypress
- `data.js` single source of truth, zero build step
- Gallery arrays must be static (not Array.from) — ADR-013
- Exabytes exit order: email → domain transfer → DNS → cancel hosting (ADR-014)
