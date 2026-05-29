# GEMS Talent — Session handoff (May 2026, session 7)
Singapore talent agency · Desktop-first editorial prototype · React 18 + Babel CDN · Inline JSX

## What landed this session

### 1. Project restructured into folders (pre-Git handoff)

   Up to session 6 everything was flat at repo root. With the project
   about to live in Git + alternate between Claude Code (deploy) and
   Claude design (UI/UX), a flat root no longer scales. Restructured
   into a conventional layout while keeping HTML pages at root so URLs
   stay clean.

   **Moved:**
   - `hero.jsx` · `nav.jsx` · `sections.jsx` · `page-header.jsx` ·
     `tweaks-panel.jsx` → `components/`
   - `styles.css` · `responsive.css` → `styles/`
   - `handoff.md` · `EMAIL_SETUP.md` → `docs/`

   **Stayed at root** (deliberate):
   - All `*.html` pages — location ↔ URL.
   - `data.js` — single content source, referenced by every page.
   - `CLAUDE.md` — Claude auto-discovery is root-only.
   - `README.md`, `.gitignore` — GitHub convention.
   - `api/`, `email-templates/`, `scripts/`, `assets/`, `uploads/`
     — already conventional locations.

   **Reference updates done in the same pass:**
   - 41 `<script>` / `<link>` refs updated across 8 HTML files
     (`index`, `artistes`, `clients`, `work`, `services`, `about`,
     `contact`, `email-preview`). `og-card.html` + `og-card-photo.html`
     had no refs to move — fully self-contained.
   - `CLAUDE.md` updated: "Read first" pointer → `docs/handoff.md`,
     single-source-of-truth table paths refreshed, new "Project
     layout" section added so future Claude sessions immediately
     understand the structure.
   - `README.md` file map refreshed end-to-end with a top-level
     tree diagram + subsystem tables.

### 2. Repo prepared for initial Git push (carried over)

   Session 6 wrote `.gitignore` and `README.md` and walked the user
   through the GitHub repo creation choices (disable README, disable
   .gitignore, no license — private commercial repo defaults to all
   rights reserved). Project zip generated and downloaded.

   User then deleted the local extract after deciding to wait for the
   restructure. Next zip (session 7 → download) is the canonical
   initial-push payload.

### 3. Footer-CTA mailto unified (carried over from session 6) ✅

   `components/sections.jsx` L396 now reads
   `window.GEMS_DATA.contact.email` (= `hello@gemstalent.com.sg`) for
   both `href` and label. Internal `talent@gems.sg` stays as the
   team-notification destination via env vars.

## File map (current state)

```
/                                Repo root — HTML pages + data + meta
├── .gitignore                   Defensive ignores
├── README.md                    GitHub repo intro
├── CLAUDE.md                    Project context for Claude
├── data.js                      🔑 ALL content (single source of truth)
│
├── index.html                   Homepage + Tweaks shell
├── artistes.html                Roster index + per-artiste detail
├── clients.html                 Grouped client roster + testimonials
├── work.html                    Case studies
├── services.html                4 service detail blocks + process strip
├── about.html                   Studio statement + principles + timeline
├── contact.html                 Enquiry form (POSTs to /api/enquiry)
├── og-card.html                 Type-led OG card renderer (1200×630)
├── og-card-photo.html           Photo-led OG card renderer (1200×630)
├── email-preview.html           Email template local renderer
│
├── components/                  ✨ NEW location
│   ├── hero.jsx                 100vh → 100dvh fallbacks (2 spots)
│   ├── nav.jsx                  Mobile drawer + hamburger
│   ├── sections.jsx             Footer CTA mailto unified (session 6)
│   ├── page-header.jsx          Only PageHeader exported
│   └── tweaks-panel.jsx         Panel max-height: 100svh fallback
│
├── styles/                      ✨ NEW location
│   ├── styles.css               Global tokens + utilities
│   └── responsive.css           Tweaks panel ceiling: 100svh fallback
│
├── docs/                        ✨ NEW location
│   ├── handoff.md               THIS FILE — rolling session log
│   └── EMAIL_SETUP.md           Resend + Upstash (Vercel-flavored — needs Netlify pass)
│
├── api/
│   └── enquiry.js               Vercel format — convert to Netlify Function during deploy
│
├── email-templates/
│   ├── team-notification.js     Branded notification to talent@gems.sg
│   └── auto-reply.js            Branded auto-reply with brass GEMS stamp
│
├── scripts/
│   ├── download-cdn-images.mjs  Template-expansion fix + --rewrite-data flag
│   ├── build-og-card-photo.mjs  Playwright PNG export
│   └── build-og-card-photo-canvas.recipe.js
│
├── assets/
│   ├── gems-stamp-nav.jpg       Nav avatar + email stamp
│   ├── gems-stamp.jpg           Stamp source
│   ├── og-card.png              Type-led 1200×630 share card
│   └── og-card-photo.png        Photo-led card (placeholder photo)
│
└── uploads/                     WP XML export + earlier handoffs (~2 MB)
```

## Deployment plan (for Claude Code session)

**Target end state:** `https://gemstalent.com.sg` serves the React site
from Netlify with auto-SSL, inboxes for the 4 mailboxes flow to Zoho,
contact form lands enquiries via Resend with branded auto-reply.

⚠️ **CRITICAL ORDERING.** The live React site currently loads 17 talent
/ work images from the WordPress CDN at `gemstalent.com.sg/wordpress/...`.
Those URLs are hardcoded in `data.js`. **If Exabytes hosting is cancelled
before those images are localized (open item #3), every talent portrait
and work case-study image on the new Netlify site breaks irrecoverably.**
Localize first, deploy second, cancel Exabytes last.

**Phase 0 — GitHub setup (done here):** `.gitignore`, `README.md`
written. User creates private repo (no README / no .gitignore / no
license at creation), pushes initial commit. Hand off to Claude Code.

**Phase 0.5 — Localize CDN images (open item #3) ⚠️ DO BEFORE DEPLOY.**
In Claude Code, run `node scripts/download-cdn-images.mjs --rewrite-data`
while the WordPress site is still live and reachable. Script pulls all
17 images into `assets/cdn/` and rewrites `data.js` paths in one pass.
Commit the result. After this, the site has no external dependencies
and Exabytes can be safely sunset later.

**Phase 1 — Netlify staging deploy.** Link GitHub repo to Netlify.
Auto-deploys to `gemstalent.netlify.app`. No DNS touched. Verify site
loads end-to-end on the staging URL.

**Phase 2 — Form endpoint conversion.** Port `api/enquiry.js` from
Vercel format to Netlify Function format (`netlify/functions/enquiry.js`).
Set env vars on Netlify dashboard: `RESEND_API_KEY`, `ENQUIRY_TO`,
`ENQUIRY_FROM`, `ENQUIRY_REPLY_TO`, `STAMP_URL`. Drop Upstash for
simplicity (in-memory fallback handles the volume — <100 enquiries/mo).
Update `contact.html` to POST to `/.netlify/functions/enquiry`.

**Phase 3 — Zoho domain verification + mailbox creation.** Sign up
Zoho, add TXT record for verification (DNS still on Exabytes/registrar
at this point — just adding a verification record, no MX changes yet).
Create the 4 mailboxes mirroring Exabytes. Configure SPF/DKIM/DMARC
records.

**Phase 4 — IMAP migration.** Use Zoho's built-in migration tool to
copy mail from Exabytes IMAP. Volume: ~1 GB total (terence.tan@ is
903 MB, marketing@ 54 MB, others negligible). Background sync; runs
1–3 hours.

**Phase 5 — Email clients on devices.** 4 staff add Zoho to their
phones / desktops. Existing Exabytes accounts can stay configured
in parallel during cutover for redundancy.

**Phase 6 — DNS cutover.** At registrar (Exabytes assumed pending
confirmation): update A/CNAME records to Netlify, update MX records
to Zoho. ~5–60 min propagation. AutoSSL kicks in automatically
once Netlify sees the domain.

**Phase 7 — Verify + monitor.** Send test emails (in + out), verify
form submission end-to-end, watch for issues for 24–48 hours.
Zoho's incremental migration can pull any stragglers that landed
at Exabytes during cutover.

**Phase 8 — Sunset Exabytes (only after Phase 7 stable).** At renewal,
either cancel outright or downgrade to email-only plan as a fallback
safety window. Do NOT cancel before Phase 0.5 is committed AND Phase 7
is verified stable — once Exabytes hosting is off, the old WP CDN is
unreachable forever.

**Total active work:** ~3–4 hours, ideally over a weekend.

**Open data points for Claude Code:**
1. Confirm registrar of `gemstalent.com.sg` (Exabytes assumed).
2. Confirm whether `hello@gemstalent.com.sg` (referenced in
   `data.js.contact.email`) exists as a real mailbox, an alias, or
   not at all. Not visible in the Exabytes mailbox screenshot the
   user shared.

## Locked design system (unchanged)

**Palette — Cool Mist + Cobalt-Led**
  Mist `#E6ECF2` · Cobalt `#0D3FA0` · Cobalt-deep `#062870` · Cobalt-soft `#2A5DC4`
  Teal `#1FA2C2` · Teal-soft `#5CC1D9`
  Brass `#C9A961` — accent only
  Clay `#D8E1ED` · Sage `#C8D4E0` — section tints · Ink `#0E1A2B`

**Type** — Inter Tight (sans, 400/500/600). Newsreader italic reserved for show/concert
title citations only (`<span className="serif-em">`). All decorative italic flourishes removed.

**Eyebrow rail** — 11px tracked +0.16em, brass dot.

**Mobile breakpoints** — 1100 / 900 / 600. Hamburger at ≤900. Sec-rail
un-sticks at ≤1100. Touch tap targets ≥44px under `hover: none`.

**Viewport units** — `100dvh` for fill-the-screen heroes (dynamic,
recalcs with chrome); `100svh` for ceilings that must never overflow
(panels, drawers). Always pair with a `100vh` fallback declared first.

## Open items for the next session

| #   | Item                                              | Notes |
|-----|---------------------------------------------------|-------|
| 1   | Replace placeholder client/testimonial copy       | DDB, Edelman, Tiger Beer + both testimonial quotes still plausible filler. `data.js → clientGroups[]` + `testimonials[]`. |
| 2   | Upload stamp + set STAMP_URL on Vercel            | **Recontextualize:** now Netlify env var, not Vercel. Set during deploy Phase 2. |
| 3   | Run CDN download (one-shot now)                   | `node scripts/download-cdn-images.mjs --rewrite-data` — downloads 17 images AND rewrites `data.js` in one pass. **Best run in Claude Code** during repo init, before first deploy. |
| 4   | Re-render `og-card-photo.png` with real photo     | After #3 lands. `scripts/build-og-card-photo.mjs` (Playwright) — photo auto-detects from `/assets/cdn/`. |
| 6   | Distinct artiste portraits                        | Lawrence Wong + Theresa Carpio still share an image for `image` and `portrait` in `data.js → roster[]`. User to provide new images. |
| 7   | Real UEN                                          | Add to `data.js.contact.uen`; footer © line auto-includes it. User to provide. |
| 8   | Real-device QA of responsive treatment            | Services-row stack on iOS, drawer on iOS Safari (now with `svh`/`dvh`), tweaks panel clamp on small screens. **Best after Netlify staging deploy** — share `gemstalent.netlify.app` to phones. |
| 11  | Convert `api/enquiry.js` → Netlify Function       | ~10 lines of differences (handler signature, response format). Drop Upstash dep. Update `contact.html` POST target. **NEW — for Claude Code Phase 2.** |
| 12  | Update `docs/EMAIL_SETUP.md` for Netlify          | Currently Vercel-flavored. Refresh env-var dashboard instructions. |
| 13  | Path-update sweep for any `<style>` or inline JS  | None known. Spot check during Claude Code first-run — if anything still references `styles.css` / `*.jsx` without a folder prefix, fix in one pass. **NEW — session 7 restructure follow-through.** |

(Items 5, 9, 10 closed in prior sessions. Session 7 was structural only — no
feature items closed; #11/#12 still open and now carry corrected paths.)

## User preferences observed (carry forward)

- `data.js` is the single source of truth — extend, don't duplicate.
- Hard placeholders (XXX, lorem) are a trust-killer — auto-suppress over fake values.
- Color adds to palette, never replaces · Brass is accent · No dark blue as dominant bg.
- Section rhythm via alternating backgrounds — never gradients-for-decoration.
- Tweaks pattern: `useTweaks(defaults)` with `EDITMODE-BEGIN`/`END` JSON blocks.
- Soft-reject spam (200 OK to bots) over hard-reject.
- When asking "where does X come from" — the answer should be ONE file.
- Responsive treatment lives in `responsive.css` alone — add a class, target it.
- Fail-open on infra (Upstash) — drop a guarantee rather than lock out real users.
- Viewport units — never bare `100vh`. Always `100vh` fallback then
  `100dvh` (fill) or `100svh` (ceiling) on the next line.
- When auditing scripts, run them mentally against the actual file
  contents (template literals vs full URLs) — regex-on-raw-text bugs hide
  silently because they exit successfully with zero matches.
- **New:** GitHub is the shared source of truth between Claude Code (CLI,
  deploy/infra work) and Claude design (UI/UX iteration). Both environments
  pull/push the same repo. Branch hygiene matters — coordinate before
  parallel work.
- **New:** Prefer free tiers that explicitly allow commercial use
  (Netlify, Zoho, Cloudflare Pages) over free tiers with ToS landmines
  (Vercel Hobby). License terms count as much as feature lists for
  business-critical infra.
