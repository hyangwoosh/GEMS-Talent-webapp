# GEMS Talent — project context

Singapore talent agency website · desktop-first editorial prototype.
React 18 + Babel CDN with inline JSX · zero build step · serves as static HTML.

## Read first, every session

**`docs/handoff.md`** is the rolling session log — what landed, current
file map, open items, design tokens. **Read it at the start of every chat**
before touching anything. Each session ends by rewriting it.

`uploads/` contains earlier handoffs and the WordPress XML export — read-only
historical reference, not active project files.

## Project layout

```
/                      ← HTML pages live at repo root (URL-driven)
  *.html               index, artistes, clients, work, services, about,
                       contact, og-card, og-card-photo, email-preview
  data.js              ALL page content (single source of truth)
  README.md            GitHub repo intro
  CLAUDE.md            THIS FILE — project context
  .gitignore

components/            All React .jsx components
  hero.jsx · nav.jsx · sections.jsx · page-header.jsx · tweaks-panel.jsx

styles/                Global CSS
  styles.css · responsive.css

docs/                  Project documentation
  handoff.md           Rolling session log — read first
  EMAIL_SETUP.md       Resend / Netlify Function env vars + verification

api/                   Form endpoint (Vercel format; converts to
                       netlify/functions/ during deploy)
  enquiry.js

email-templates/       Branded email HTML (used by api/enquiry.js)
  team-notification.js · auto-reply.js

scripts/               One-shot tooling
  download-cdn-images.mjs · build-og-card-photo.mjs · *.recipe.js

assets/                Site images (stamps, OG cards, + future cdn/)
uploads/               Historical reference (WP export, earlier handoffs)
```

HTML pages reference components and styles via subdirectory paths:
`<script src="components/sections.jsx">`, `<link href="styles/styles.css">`.
`data.js` stays at root because it's the single content source referenced
by every page.

## Single sources of truth (do not duplicate)

| Concern | Lives in | Notes |
|---|---|---|
| All page content (roster, services, clients, copy, contact info) | `data.js` | One `window.GEMS_DATA` object. Extend, never duplicate. |
| Global styles + tokens | `styles/styles.css` | CSS custom properties at `:root`. |
| Mobile/tablet responsive treatment | `styles/responsive.css` | Never sprinkle `@media` into per-page `<style>` tags — add a class, target it from here. |
| Email infrastructure | `api/enquiry.js` + `email-templates/` + `docs/EMAIL_SETUP.md` | Resend for delivery, Upstash REST for rate limit (fail-open to in-memory). |
| Design system + open items + session log | `docs/handoff.md` | THE roadmap. |

When asking "where does X come from" the answer should be **one** file.

## Locked design system (do not invent variants)

**Palette — Cool Mist + Cobalt-Led**
- Mist `#E6ECF2` · Cobalt `#0D3FA0` · Cobalt-deep `#062870` · Cobalt-soft `#2A5DC4`
- Teal `#1FA2C2` · Teal-soft `#5CC1D9`
- Brass `#C9A961` — **accent only**, never dominant
- Clay `#D8E1ED` · Sage `#C8D4E0` — section tints · Ink `#0E1A2B`
- Color **adds** to the palette, never replaces. No dark blue as dominant bg.
- Section rhythm via alternating tinted backgrounds — never gradients-for-decoration.

**Type** — Inter Tight (sans 400/500/600). Newsreader italic reserved
strictly for show/concert title citations (`<span className="serif-em">`).
JetBrains Mono for eyebrow rails + numerals. No decorative italic.

**Eyebrow rail** — 11px, tracked `+0.16em`, uppercase, brass dot prefix.

**Mobile breakpoints** — 1100 / 900 / 600. Hamburger appears at ≤900px.
Sec-rail un-sticks at ≤1100px. Touch tap targets ≥44px under `hover: none`.

**Viewport units** — never bare `100vh`. Always write `100vh` first as
fallback, then `100dvh` (fill) or `100svh` (ceiling) on the next line.
Cross-platform issue (iOS Safari, Android Chrome, ChromeOS keyboards), not
iOS-specific.

**Iconography** — `lucide-react`-style outline icons inline, 1.5px stroke.
ArrowRight is the canonical CTA glyph. No emoji.

**Tweaks** — `useTweaks(defaults)` pattern with `/*EDITMODE-BEGIN*/{...}/*EDITMODE-END*/`
JSON blocks so changes persist to disk.

## Pages (all 7 wired and functional)

`index.html` (homepage) · `artistes.html` · `clients.html` · `work.html` ·
`services.html` · `about.html` · `contact.html`

Plus `og-card.html` (type-led) and `og-card-photo.html` (photo-led) — reference HTML
that builds `/assets/og-card*.png` for social previews.

## Operational principles

- **Hard placeholders are a trust-killer.** No `XXX`/`lorem` filler — auto-suppress
  over fake values. Visible-as-placeholder UI (labelled crosshairs, etc.) is fine.
- **Fail-open on infra.** Upstash blip → in-memory fallback. Better to drop a
  rate-limit guarantee than lock out a real client.
- **Soft-reject spam** (200 OK to bots) over hard-reject — hard-reject trains them
  to retry.
- **Honor the existing voice.** Editorial, restrained, sentence-case CTAs.
  No marketing breathlessness.

## Image hosting status

`data.js` currently references the live WordPress CDN at
`https://gemstalent.com.sg/wordpress/wp-content/uploads/...` via a `const CDN`
prefix + template literals. To localize:

    node scripts/download-cdn-images.mjs --rewrite-data

One command downloads all 17 images into `/assets/cdn/` AND rewrites `data.js`
to point at local paths. Sandbox can't reach external HTTP, so run locally.

## Quick "what's open" pointer

See `docs/handoff.md` § "Open items for the next session". Anything not in
that table is either done or out of scope.
