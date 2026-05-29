# GEMS Talent — Session handoff (May 2026, session 4)
Singapore talent agency · Desktop-first editorial prototype · React 18 + Babel CDN · Inline JSX

## What landed this session

### 1. StubBody removed (open item #6) ✅

   `page-header.jsx` only exports `PageHeader` now. The unused `StubBody`
   export (and its placeholder "page coming next" body) was carrying its
   own `<ArrowRight />` reference; deleted clean — no consumers in the
   tree.

### 2. Mobile breakpoints — full-site pass (open item #3) ✅

   Viewport metas on all 7 pages flipped from `width=1280` → `width=device-width, initial-scale=1`.
   New `responsive.css` linked from every page; layered on top of `styles.css`
   so the responsive treatment lives in one file.

   Three tiers + a touch-only pass:

   - **≤1100px** — `.rail-grid` collapses to a single column, `.sec-rail`
     un-sticks. Roster 4→3, work preview 3→2. Inner-page grids (about,
     clients, work, services, artistes) flatten via class selectors on
     their existing class names (`.studio .grid`, `.c-summary`, `.gal-2`,
     `.svc-grid`, `.a-grid`, etc).
   - **≤900px** — Type scale shrinks (display clamp drops to 88px ceiling).
     Hero stacks (split + asymmetric both go 1-col, fullbleed unchanged).
     Stats 4→2 with hairline grid, roster 4→2, work preview 2→1.
     Services rows collapse to a 2-row stack (number + title on row 1,
     blurb spans both columns on row 2, arrow hidden). Footer 3-col →
     2-col with the logo column spanning full. Contact form 2-col → 1.
   - **≤600px** — Stats 2→1 (top-border rhythm instead of left-border).
     Roster 2→1 (4:5 aspect). Footer → 1. Footer-CTA buttons go
     full-width-stacked.
   - **`hover: none, pointer: coarse`** — `.nav-link` gets 14px padding
     (44px target), `.btn` gets `min-height: 44px`, services-row blurbs
     no longer hide behind hover.

   `html, body { max-width: 100% }` to guarantee no horizontal scroll.

### 3. Mobile nav drawer ✅

   `nav.jsx` Nav refactored. Desktop nav unchanged at >900px. Below that,
   the link list + meta + CTA hide via class selectors (`.nav-links`,
   `.nav-meta`, `.nav-cta`) and a new hamburger button (`.nav-burger`,
   `display:none !important` at desktop, `inline-flex` below 900px) opens
   a right-edge drawer.

   Drawer (`.nav-drawer` overlay + `.nav-drawer__panel`):
   - Right-edge slide-in, `width: min(420px, 86vw)` (→ 100vw under 600px).
   - Overlay (rgba ink wash) closes on tap outside the panel.
   - `Esc` key closes; `document.body.style.overflow = "hidden"` while open.
   - Six numbered links (01–06) with brass mono numerals, ArrowRight glyph,
     hairline-divided rows.
   - Foot: "Cast a brief" CTA (cobalt) + `SG · KL · JKT` mono caption.

   Classes added to existing components so `responsive.css` can target
   without rewriting React: `.stats-grid`, `.roster-grid`, `.work-grid`,
   `.services-rows`, `.service-row`, `.hero-split`, `.hero-asym`,
   `.hero-rail`, `.footer-cols`, `.contact-grid`, `.nav-grid`,
   `.nav-links`, `.nav-meta`, `.nav-cta`.

### 4. CDN image localizer (open item #4) ✅

   `scripts/download-cdn-images.mjs` — zero-dep Node ≥18 script.
   - Regex-walks `data.js` for any `gemstalent.com.sg/.../wp-content/uploads/…`
     URL (matches both `/wp-content/` and the `/wordpress/wp-content/`
     pattern), dedupes, sorts.
   - Downloads each into `/assets/cdn/<basename>`. Every basename in the
     WP export is unique, so the date segments (`/2026/05/`, `/2021/05/`)
     can flatten safely.
   - Idempotent: skips files already on disk.
   - Writes `assets/cdn-map.json` (full URL → local path) so the swap in
     `data.js` is a mechanical sed pass.
   - `--dry-run` lists URLs without fetching.

   The follow-on step (run the script, then change `const CDN = …` in
   `data.js` to `assets/cdn` and drop the `2026/05/` segments) is
   intentionally **not** done in this session — needs the network and
   a sanity-check pass on real files.

### 5. Upstash-backed rate limit (open item #7) ✅

   `api/enquiry.js` rate limiter is now backend-agnostic.

   - If `UPSTASH_REDIS_REST_URL` AND `UPSTASH_REDIS_REST_TOKEN` are both
     set, routes through Upstash REST pipeline — one HTTP round-trip per
     request with `INCR + EXPIRE NX` for each window (60s short / 1h long).
     Keys: `gems:rl:short:<ip>` and `gems:rl:long:<ip>`.
   - If either env var is missing, falls through to the existing in-memory
     `Map`.
   - **Fail-open** on Upstash errors (network blip, quota exceeded, etc.) —
     warns to console and falls back to the in-memory map. Never locks
     real users out due to KV trouble.
   - Pipeline result normalisation handles both `{result}` object format
     and bare-result array format across Upstash versions.

   `EMAIL_SETUP.md` gets a new section 5a documenting the two env vars
   and the failure-mode trade-offs.

### 6. Photo-led OG variant (open item #9) ✅

   New artifact: `og-card-photo.html` + `assets/og-card-photo.png`.

   Composition is split 44/56 — left panel is cobalt-deep with the real
   stamp (clipped to a 44px roundel), mono eyebrow `GEMS · TALENT · SG`,
   three-line headline echo (line 3 in brass), brass rule, GEMS Talent
   wordmark, REPRESENTATION · MARKETING · PRODUCTION tag, geo footer.
   Right panel is the featured production photo with a cobalt ink-wash
   on the left edge for legibility and a brass hairline seam where the
   panels meet. Photo-side gets a quiet bottom-right mono caption
   (`RWS EXCLUSIVE SHOWCASE · feat. Shila Amzah`).

   **Current state of the PNG:** the photo is a labelled crosshair
   placeholder (corner brackets + brass `FEATURED PHOTO` + "download CDN
   images, then re-run scripts/build-og-card-photo.mjs"). The drawing
   code probes `/assets/cdn/RWS-Exclusive-Showcase-Shila-Amzah.jpg`
   (and two fallbacks) — once those land, re-running the canvas builder
   produces a finished card.

   Two regen paths (both kept around):
   - `scripts/build-og-card-photo.mjs` — Playwright headless screenshot
     of `og-card-photo.html` at 1200×630, 2x DPR.
   - `scripts/build-og-card-photo-canvas.recipe.js` — comment-only file
     pointing at the canvas-driven approach used for the type-led card.
     Paste into a `run_script` call when re-rendering.

   **Not wired into prod yet** — every page's `og:image` still points at
   the type-led `/assets/og-card.png`. The photo-led card is the
   companion variant; per-page activation (likely `work.html` and
   `artistes.html`) is deferred until a real photo replaces the
   placeholder.

## File map (current state)

```
index.html                Homepage + Tweaks shell · viewport=device-width · responsive.css linked
hero.jsx                  Hero — .hero-split / .hero-asym / .hero-rail classes added
nav.jsx                   ✨ Mobile drawer + hamburger; desktop nav unchanged
sections.jsx              Footer (data-driven), Roster, Services, Work — responsive classes added
page-header.jsx           ✨ StubBody dropped; only PageHeader exported
data.js                   ALL content (single source of truth)
tweaks-panel.jsx          Drag panel, controls, JSON persistence
styles.css                Global tokens + utilities
responsive.css            ✨ Mobile/tablet overrides — three tiers + touch pass
artistes.html             Roster index + per-artiste detail · viewport fixed
clients.html              Grouped client roster + testimonials · viewport fixed
work.html                 3 case studies + galleries + slug anchors · viewport fixed
services.html             4 service detail blocks + process strip · viewport fixed
about.html                Studio statement + principles + timeline · viewport fixed
contact.html              Enquiry form + ?artiste/?service chip · .contact-grid class
og-card.html              Reference HTML for the type-led OG card
og-card-photo.html        ✨ Reference HTML for the photo-led OG card
assets/
  gems-stamp-nav.jpg      Stamp (white bg, used in nav avatar + emails)
  gems-stamp.jpg          Stamp source
  og-card.png             Type-led 1200×630 share card (default og:image)
  og-card-photo.png       ✨ Photo-led 1200×630 share card (placeholder photo for now)
api/enquiry.js            ✨ Upstash + in-memory rate limit · honeypot · timing gate
email-templates/          team-notification.js + auto-reply.js — stamp URL + brass rule
email-preview.html        Context tweak (none/artiste/service/all) + stampUrl opt
scripts/
  download-cdn-images.mjs ✨ Zero-dep CDN image downloader + URL mapping
  build-og-card-photo.mjs ✨ Playwright PNG export for the photo-led card
  build-og-card-photo-canvas.recipe.js ✨ Note pointing at the canvas recipe
EMAIL_SETUP.md            ✨ Section 5a — Upstash setup + failure-mode notes
handoff.md                THIS FILE
uploads/                  WordPress XML export + earlier handoff (read-only reference)
```

## Locked design system (unchanged)

**Palette — Cool Mist + Cobalt-Led**
  Mist `#E6ECF2` · Cobalt `#0D3FA0` · Cobalt-deep `#062870` · Cobalt-soft `#2A5DC4`
  Teal `#1FA2C2` · Teal-soft `#5CC1D9`
  Brass `#C9A961` — accent only
  Clay `#D8E1ED` · Sage `#C8D4E0` — section tints · Ink `#0E1A2B`

**Type** — Inter Tight (sans, 400/500/600). Newsreader italic reserved for show/concert
title citations only (group F). All decorative italic flourishes removed.

**Eyebrow rail** — 11px tracked +0.16em, brass dot.

**Mobile breakpoints (new)** — 1100 / 900 / 600. Hamburger appears at ≤900.
Sec-rail un-sticks at ≤1100. Touch tap targets ≥44px under `hover: none`.

## Open items for the next session

| #   | Item                                              | Notes |
|-----|---------------------------------------------------|-------|
| 1   | Replace placeholder client/testimonial copy       | DDB, Edelman, Tiger Beer + both testimonial quotes still plausible filler. Lives in `data.js → clientGroups[]` + `testimonials[]`. |
| 2   | Upload stamp + set STAMP_URL on Vercel            | One-time. Default fallback URL is correct post-typo-fix; still worth pinning to a controlled URL. |
| 3   | Run CDN download + swap `data.js`                 | `node scripts/download-cdn-images.mjs`, then in `data.js`: change `const CDN = "https://gemstalent.com.sg/wordpress/wp-content/uploads"` → `const CDN = "assets/cdn"` and strip the `/2026/05/` and `/2021/05/` segments from every template string. Every basename is unique. |
| 4   | Re-render `og-card-photo.png` with real photo     | Once #3 lands, paste the canvas recipe into a `run_script` call (or run `scripts/build-og-card-photo.mjs`) — the photo auto-detects from `/assets/cdn/`. |
| 5   | Activate the photo-led OG card per page           | Likely `work.html` + `artistes.html` (photo-led content). Point `og:image` + `twitter:image` at `/assets/og-card-photo.png`. Keep the type-led card on the chromeless pages (index, services, about, clients, contact). |
| 6   | Distinct artiste portraits                        | Lawrence Wong + Theresa Carpio still use the same image for `image` and `portrait`. |
| 7   | Real UEN                                          | Add to `data.js.contact.uen`; footer © line auto-includes it. |
| 8   | Real-device QA of responsive treatment            | Especially: services-row stack on iOS, drawer on iOS Safari (`100vh` + safe-area), tweaks panel clamp on small screens. |
| 9   | iOS Safari `100vh` audit                          | Hero uses `min-height: 100vh` then we override `auto` at ≤900px — confirm no leftover viewport-height traps. |

## User preferences observed (carry forward)

- `data.js` is the single source of truth — extend, don't duplicate.
- Hard placeholders (XXX, lorem) are a trust-killer — auto-suppress over fake values.
  (Followed for the photo-led OG card: a labelled "FEATURED PHOTO" crosshair is
  visibly a placeholder, not a half-finished design.)
- Color adds to palette, never replaces · Brass is accent · No dark blue as dominant bg.
- Section rhythm via alternating backgrounds — never gradients-for-decoration.
- Tweaks pattern: `useTweaks(defaults)` with `EDITMODE-BEGIN`/`END` JSON blocks.
- Soft-reject spam (200 OK to bots) over hard-reject (which trains them to retry).
- When asking "where does X come from" — the answer should be ONE file.
- **New:** Responsive treatment lives in `responsive.css` alone — don't sprinkle
  `@media` blocks into per-page `<style>` tags. Add a class to the React/HTML
  element, target it from `responsive.css`.
- **New:** Fail-open on infra (Upstash) — better to drop a rate-limit guarantee
  than lock out a real client because Redis is having a bad day.
