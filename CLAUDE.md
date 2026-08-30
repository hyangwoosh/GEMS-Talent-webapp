# GEMS Talent — project context

Singapore talent agency website. **Mid-rebuild:** the live site is the legacy
React-via-Babel-CDN build at repo root; the replacement is an Astro 7 app in
`site/`. Both live in this repo until cutover.

## Read first, every session

1. **`docs/handoff.md`** — rolling session log: what landed, current file map,
   open items. Read it before touching anything. Each session ends by rewriting it.
2. **`docs/DECISIONS.md`** — 16 ADRs. The rebuild amendments are at the bottom
   under "Rebuild amendments — August 2026". Don't re-argue settled decisions;
   follow the amendment protocol at the end of that file if one genuinely needs
   revisiting.

`uploads/` is read-only historical reference (WordPress XML export, earlier
handoffs) — not active project files.

## Two trees, one repo

```
/                    LEGACY — the currently live site
  *.html             12 pages, React 18 UMD + @babel/standalone, no build
  data.js            window.GEMS_DATA — all legacy content
  components/*.jsx   hero · nav · sections · page-header · tweaks-panel
  styles/*.css       styles.css · responsive.css
  netlify/functions/ enquiry.js — the live form endpoint
  netlify.toml       publish "." + /api/enquiry redirect + security headers
  _redirects         17 WordPress → React URL rules (SEO, do not lose)
  404.html · sitemap.xml · robots.txt

site/                REBUILD — Astro 7 + TypeScript
  src/content/       artistes · events · services · clients · updates (MDX/JSON)
  src/content.config.ts   Zod schemas — the contract
  src/layouts/ · src/pages/ · src/components/
  src/assets/        images, processed by Astro's pipeline
  public/admin/      Sveltia CMS (optional, deferred)

docs/                handoff.md · DECISIONS.md · DEPLOYMENT_RUNBOOK.md
                     EMAIL_SETUP.md · redirects.md · ZOHO_TEAM_SETUP.md
                     USER_MIGRATION_GUIDE.md · CLAUDE_CODE_START.md
email-templates/     team-notification.js · auto-reply.js
scripts/             one-shot tooling incl. the data.js → collections migration
assets/cdn/          32 localized images (legacy paths)
```

**Never delete or edit legacy files to make the rebuild work.** Root keeps
deploying to Netlify and serving real traffic until cutover.

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 7 + TypeScript strict, static output |
| Content | Zod-validated content collections, one file per record |
| Interactive | React islands only where needed (nav, gallery, form) |
| Hosting | Cloudflare Workers (**after cutover** — Netlify serves it today) |
| DNS | Cloudflare, DNS-only mode |
| Registrar | Exabytes — locked, `.com.sg` can't transfer |
| Enquiry store | Zoho CRM Free |
| Team alerts | Telegram bot |
| Auto-reply | Resend |
| Mailboxes | Zoho Mail, 3 accounts |
| Analytics | Cloudflare Web Analytics |
| Bot protection | Cloudflare Turnstile |
| Editing UI | Sveltia CMS — optional, deferred |

## Single sources of truth (do not duplicate)

| Concern | Lives in |
|---|---|
| Rebuild content | `site/src/content/**` — schemas in `site/src/content.config.ts` |
| Legacy content | `data.js` (frozen — migrate from it, don't extend it) |
| Design tokens | `site/src/styles/tokens.css`, ported from `styles/styles.css` |
| Enquiry pipeline | `site/src/pages/api/enquiry.ts` + `email-templates/` |
| Decisions | `docs/DECISIONS.md` |
| Session log + open items | `docs/handoff.md` |

## Content model

Five collections. The relationships are the point — the legacy `data.js` used
plain strings as foreign keys with nothing validating them.

- **`artistes`** — name, nameZh, disciplines, languages, portrait, gallery,
  showreel, instagram, structured `credits[]`
- **`events`** — title, venue, **date**, client ref, **`artistes[]` refs**,
  roles, hero, gallery, `featured` flag
- **`clients`** — name, group, engagement, **`verified` (default `false`)**
- **`services`**, **`updates`**

Three rules:

1. **`artistes` ↔ `events` is many-to-many**, via `reference()` both ways. A
   broken reference fails the build.
2. **`featured: true` on an event** drives the homepage rotator. There is no
   separate featured list — that duplication is what the rebuild removes.
3. **`verified: false` clients never render.** Names must be confirmed as real
   engagements before they appear. This is enforced by the build, not by
   remembering.

## Locked design system (do not invent variants)

Unchanged from the legacy site. Port it; don't redesign it.

**Palette — Cool Mist + Cobalt-Led**
- Mist `#E6ECF2` · Cobalt `#0D3FA0` · Cobalt-deep `#062870` · Cobalt-soft `#2A5DC4`
- Teal `#1FA2C2` · Teal-soft `#5CC1D9`
- Brass `#C9A961` — **accent only**, never dominant
- Clay `#D8E1ED` · Sage `#C8D4E0` — section tints · Ink `#0E1A2B`
- Color **adds** to the palette, never replaces. No dark blue as dominant bg.
- Section rhythm via alternating tinted backgrounds — never gradients-for-decoration.

**Type** — Inter Tight (sans 400/500/600). Newsreader italic reserved strictly
for show/concert title citations (`.serif-em`). JetBrains Mono for eyebrow rails
+ numerals. No decorative italic.

**Eyebrow rail** — 11px, tracked `+0.16em`, uppercase, brass dot prefix.

**Breakpoints** — 1100 / 900 / 600. Hamburger ≤900px. Sec-rail un-sticks
≤1100px. Tap targets ≥44px under `hover: none`.

**Viewport units** — never bare `100vh`. Write `100vh` first as fallback, then
`100dvh` (fill) or `100svh` (ceiling). Cross-platform, not iOS-specific.

**Iconography** — `lucide-react`-style outline icons inline, 1.5px stroke.
ArrowRight is the canonical CTA glyph. No emoji.

## Enquiry pipeline

`POST /api/enquiry` fans out with `Promise.allSettled` — never `all`:

1. **Zoho CRM** — the lead record, source of truth
2. **Telegram** — instant team alert
3. **Resend** — branded auto-reply to the enquirer

Return 200 if the store succeeded, even if email didn't. The legacy function
returns 502 on a Resend failure and **loses the enquiry entirely** — no retry,
no queue, no record. That is the defect being fixed.

Constraints:

- Zoho CRM Free has **no custom fields**. Map only to standard Lead fields:
  `Last_Name`, `First_Name`, `Email`, `Phone`, `Company`, `Description`,
  `Lead_Source`.
- `Lead_Source` is a picklist and **`"Website"` is not a valid value** — add it
  to the picklist or use an existing entry.
- The Zoho org is on an Enterprise trial until **12 September 2026**, then
  downgrades to Free. Don't build on trial-only features.
- Zoho API URLs are datacentre-specific (`.com` / `.eu` / `.in` / `.com.au`).
  Wrong DC returns 401 with no explanation.

Carry forward from the legacy function: honeypot field, minimum fill-time check,
HTML-escaping of every input, 5000-char cap, and **soft-reject spam with 200 OK**.

## Operational principles

- **Hard placeholders are a trust-killer.** No `XXX`/`lorem` filler — auto-suppress
  over fake values. The live site currently publishes unverified client names;
  the `verified` flag exists so the rebuild cannot repeat that.
- **Fail-open on infra.** A dropped guarantee beats locking out a real client.
- **Soft-reject spam** (200 OK to bots) — hard-reject trains them to retry.
- **Honor the existing voice.** Editorial, restrained, sentence-case CTAs.
  No marketing breathlessness.
- **Don't break the live site.** Every rebuild change is additive under `site/`
  until cutover.

## Quick "what's open" pointer

`docs/handoff.md` § open items. Anything not there is done or out of scope.
