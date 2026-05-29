# GEMS Talent

The marketing site for **GEMS Talent**, a Singapore talent agency.
Desktop-first editorial prototype, mobile-responsive, originally built in
Claude design and migrated to Git for deployment + ongoing iteration.

Live site: `https://gemstalent.com.sg` (post-deploy)

---

## Quick start

This project is **build-step-free**. No `npm install`, no bundler, no transpile step.
Just open `index.html` in a browser, or serve the folder statically:

```bash
# Option 1 — any static server
npx serve .

# Option 2 — Python
python3 -m http.server 8000

# Option 3 — just double-click index.html (most things work, form POST won't)
```

Visit `http://localhost:3000` (or whatever port your server uses).

---

## Tech stack

- **React 18.3.1** loaded from unpkg CDN
- **Babel Standalone 7.29.0** transpiles `.jsx` files **in the browser** at page load
- **Vanilla CSS** with custom properties (`styles.css`, `responsive.css`)
- **One global data object** (`window.GEMS_DATA` in `data.js`) — single source of truth for all page content
- **Form backend** — currently `api/enquiry.js` (Vercel function format). To be converted to a Netlify Function on deploy. Uses [Resend](https://resend.com) for transactional email.

The stack was chosen deliberately: maximal iteration speed, zero build friction,
serves as a flat folder of files on any host.

---

## File map

```
/                            Repo root — HTML pages, data, project meta
├── *.html                   10 pages — see table below
├── data.js                  🔑 ALL page content (single source of truth)
├── README.md                THIS FILE
├── CLAUDE.md                Project context for Claude
│
├── components/              All React .jsx components
├── styles/                  Global CSS
├── docs/                    Documentation — read docs/handoff.md first
├── api/                     Form endpoint (Vercel format)
├── email-templates/         Branded email HTML
├── scripts/                 One-shot tooling
├── assets/                  Site images
└── uploads/                 Historical reference (read-only)
```

### Pages (HTML shells, at repo root)

| File | Purpose |
|---|---|
| `index.html` | Homepage — hero, services, featured talent, footer CTA |
| `artistes.html` | Roster directory |
| `clients.html` | Client list |
| `work.html` | Case studies / past projects |
| `services.html` | Services breakdown |
| `about.html` | About the agency |
| `contact.html` | Contact form (POSTs to `/api/enquiry`) |
| `og-card.html` | OG card renderer — type-led (1200×630) |
| `og-card-photo.html` | OG card renderer — photo-led (1200×630) |
| `email-preview.html` | Local renderer for email templates |

### React components — `components/`

| File | What it is |
|---|---|
| `components/hero.jsx` | Homepage masthead |
| `components/sections.jsx` | All major page sections — rosters, services, footer CTA, etc. The big one. |
| `components/nav.jsx` | Top nav + mobile drawer (uses React state) |
| `components/page-header.jsx` | Shared section-header component |
| `components/tweaks-panel.jsx` | In-page Tweaks UI — uses React hooks + localStorage persistence |

### Data + styles

| File | Notes |
|---|---|
| `data.js` | All page content. **Single source of truth** — extend, never duplicate. Stays at repo root because every page references it. Currently uses WordPress CDN URLs for images. |
| `styles/styles.css` | Global styles + design tokens at `:root` |
| `styles/responsive.css` | All `@media` queries. Per-page styles must add a class targeted from here, never inline `@media` blocks. |

### Backend (form endpoint) — `api/`

| File | Notes |
|---|---|
| `api/enquiry.js` | Vercel-format function. Sends team notification + auto-reply via Resend. Has rate limiting via Upstash REST. To be converted to Netlify Function on deploy. |
| `email-templates/team-notification.js` | Branded team notification email — sent on every enquiry |
| `email-templates/auto-reply.js` | Branded auto-reply with brass GEMS stamp — sent to the enquirer |

### Scripts — `scripts/`

| File | Notes |
|---|---|
| `scripts/download-cdn-images.mjs` | One-shot: downloads all WP CDN images referenced in `data.js` to `assets/cdn/` and rewrites paths. Run with `node scripts/download-cdn-images.mjs --rewrite-data`. |
| `scripts/build-og-card-photo.mjs` | Renders the photo-led OG card to PNG via Puppeteer |
| `scripts/build-og-card-photo-canvas.recipe.js` | Canvas-based fallback if you don't want Puppeteer |

### Documentation — `docs/`

| File | Notes |
|---|---|
| `docs/handoff.md` | **Read first.** Rolling session log: what landed, current open items, design tokens, file map. Updated at the end of every working session. |
| `docs/EMAIL_SETUP.md` | Resend account setup, env vars, MX records for sender domain verification |
| `CLAUDE.md` | (Lives at root for Claude auto-discovery.) Project context: design system, conventions, single-source-of-truth rules |
| `uploads/` | Earlier handoffs + WordPress XML export. Read-only historical reference, not active project files. |

---

## Design system (locked — do not invent variants)

**Palette — Cool Mist + Cobalt-Led**
- Mist `#E6ECF2` · Cobalt `#0D3FA0` · Cobalt-deep `#062870` · Cobalt-soft `#2A5DC4`
- Teal `#1FA2C2` · Teal-soft `#5CC1D9`
- Brass `#C9A961` — **accent only**, never dominant
- Clay `#D8E1ED` · Sage `#C8D4E0` — section tints · Ink `#0E1A2B`

**Type** — Inter Tight (sans 400/500/600). Newsreader italic reserved
strictly for show/concert title citations (`<span className="serif-em">`).
JetBrains Mono for eyebrow rails + numerals.

**Eyebrow rail** — 11px, tracked `+0.16em`, uppercase, brass dot prefix.

**Breakpoints** — 1100 / 900 / 600. Hamburger appears at ≤900px.

**Viewport units** — never bare `100vh`. Always write `100vh` first as fallback,
then `100dvh` (fill) or `100svh` (ceiling) on the next line.

Full design system reference lives in `CLAUDE.md` and the "What landed" section
of the current `docs/handoff.md`.

---

## Conventions

- **Single source of truth.** Each concern lives in exactly one file. Content → `data.js`. Tokens → `styles/styles.css`. Responsive → `styles/responsive.css`. Email infra → `api/enquiry.js` + `email-templates/`. Design system + open items → `docs/handoff.md`.
- **No hard placeholder text.** No `XXX` / `lorem` filler. Auto-suppress over fake values.
- **Fail-open on infra.** Upstash blip → in-memory rate-limit fallback. Better to drop a guarantee than lock out a real client.
- **Honor the existing voice.** Editorial, restrained, sentence-case CTAs. No marketing breathlessness.
- **Tweaks panel persistence** uses the `/*EDITMODE-BEGIN*/{...}/*EDITMODE-END*/` JSON block convention so changes survive reloads and can be written back to disk.

---

## Deploy

Deploy target: **Netlify** (free tier, commercial use allowed).
Email hosting: **Zoho Mail** (free tier, up to 5 users).
Domain: `gemstalent.com.sg` (Exabytes registrar).

See `docs/handoff.md` § "Deployment plan" for the step-by-step.

The site itself is pure static — point any host at the repo root and it'll serve.
The only piece requiring a runtime is `api/enquiry.js` (form handler), which
becomes a Netlify Function on deploy.

---

## Working with the codebase

This project alternates between two environments:

1. **Claude Code (CLI)** — deploy work, env vars, DNS, mail migration, anything terminal-heavy
2. **Claude design** — UI/UX iteration, design exploration, copy edits, component changes (live preview)

GitHub is the shared source of truth — both environments pull from / push to this repo. When jumping back to Claude design for design work, the project is loaded by pulling the latest from GitHub.

See `docs/handoff.md` for the current session log and open items before starting any work.
