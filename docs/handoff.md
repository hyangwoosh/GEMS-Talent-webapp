# GEMS Talent — Session handoff (May 2026, session 8)
Singapore talent agency · Desktop-first editorial prototype · React 18 + Babel CDN · Inline JSX

## What landed this session

### 1. Claude Code handoff package written

   The previous session staged the repo for Git. This session writes the
   docs Claude Code needs to take over deployment + email migration
   without re-deriving decisions.

   **New files in `docs/`:**
   - **`DEPLOYMENT_RUNBOOK.md`** — 8-phase plan (0 → 8) with explicit
     acceptance criteria per phase, the ⚠️ critical ordering warning
     up top, decision rationale embedded inline, and a rollback plan.
     This is the operational spine of the migration.
   - **`DECISIONS.md`** — 12 architectural decision records (ADRs)
     capturing every locked decision: Netlify (not Vercel), Zoho
     (not Google), drop Upstash, no TypeScript/Redux/Redis/Cypress,
     `marketing@` over `hello@`, bold cutover, etc. With reasoning.
     Claude Code reads this to know what NOT to re-debate.
   - **`ZOHO_TEAM_SETUP.md`** — one-pager for the 4 staff members.
     Covers iOS Mail, Android Gmail app, macOS Mail, Outlook,
     Thunderbird. Common-problems section included. User forwards
     this to each staff member during Phase 5.
   - **`redirects.md`** — parsed `uploads/gemstalent.WordPress.2026-05-05.xml`
     to build the WordPress URL → new React URL map. Produces a
     Netlify-format `_redirects` block to drop at repo root.
     Preserves SEO + inbound links.
   - **`CLAUDE_CODE_START.md`** — first-prompt guide for the user.
     Includes the verbatim opening prompt, expected response,
     suggested session arc (3 sessions to complete migration), and
     guardrails for when Claude Code should escalate to a Claude
     design session.

### 2. Public email swap landed (data.js + cascade fixups)

   Decided this session: drop `hello@gemstalent.com.sg` (placeholder
   that never existed as a mailbox), use `marketing@gemstalent.com.sg`
   (real mailbox) as the public-facing address. ADR-007 documents
   this + preserves the option to create `hello@` on Zoho later as a
   forward to `marketing@`.

   Files touched:
   - `data.js` — both `footerCTAs.direct.title` AND `contact.email`
   - `components/sections.jsx` — fallback in `Footer` component
   - `email-templates/auto-reply.js` — hardcoded mailto in the email
     template
   - `docs/EMAIL_SETUP.md` — sample address in domain-verification
     instructions

   Zero remaining references to `hello@gemstalent.com.sg` in active
   code. Historical mentions in `docs/handoff.md` (session 6 entry)
   and `uploads/` left intact — they document what happened, not
   what is.

### 3. User-side prep confirmed (locked in DECISIONS.md)

   - **Resend:** account exists, API key generated, domain
     `gemstalent.com.sg` verified. Ready for Phase 2 env-var paste.
   - **Exabytes:** user has registrar admin access. Confirmed.
   - **DMARC:** Resend provided their own (more complete) DMARC
     record. Use as-is, skip `rua=` reporting for now.
   - **Google Search Console:** user has TXT verification record
     to add; batched with all other DNS adds in Phase 3.
   - **Cutover style:** bold (one-weekend full flip). Confirmed:
     mailboxes aren't actively receiving live mail, so blip risk ≈ 0.
   - **Mbox backup:** scheduled in Phase 4a. User has 1.3 Gbps
     downlink — backup is ~5–10 min.

## What landed in session 7 (carried forward, for reference)

- Project restructured into folders: `components/`, `styles/`, `docs/`.
  HTML pages stay at root for URL cleanliness. `data.js`, `CLAUDE.md`,
  `README.md`, `.gitignore` stay at root by convention.
- 41 `<script>`/`<link>` refs updated across 8 HTML pages.
- `CLAUDE.md` got a new "Project layout" section.
- `README.md` file map rewritten end-to-end.

## What landed in session 6 (carried forward)

- Footer-CTA mailto unified to read `data.js.contact.email` (closed open item #10).
- `.gitignore` + initial `README.md` written for Git push.
- Deployment direction decided: Netlify Free + Zoho Free + GitHub as spine.

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
├── docs/                        Documentation
│   ├── handoff.md               THIS FILE — rolling session log
│   ├── DEPLOYMENT_RUNBOOK.md    ✨ NEW — 8-phase migration plan
│   ├── DECISIONS.md             ✨ NEW — 12 ADRs, locked decisions
│   ├── ZOHO_TEAM_SETUP.md       ✨ NEW — one-pager for the 4 staff
│   ├── redirects.md             ✨ NEW — WP → React URL map + _redirects block
│   ├── CLAUDE_CODE_START.md     ✨ NEW — first-prompt guide for user
│   └── EMAIL_SETUP.md           Resend setup (still Vercel-flavored — Claude Code refreshes during Phase 2)
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

## Deployment plan (handed off to Claude Code)

**Full plan moved to `docs/DEPLOYMENT_RUNBOOK.md`** — 8 phases (0 → 8) with
explicit acceptance criteria, the ⚠️ critical ordering warning at top,
decision rationale embedded inline, and a rollback plan. Claude Code
reads it as the first task of every session.

**One-line summary of phase order:**
> Phase 0 (repo) → Phase 0.5 (localize CDN ⚠️) → Phase 1–2 (staging deploy + form fn) → Phase 3–5 (email setup, backup, IMAP migrate) → Phase 6 (DNS cutover) → Phase 7 (24–48 hr verify) → Phase 8 (sunset Exabytes)

**Locked decisions** (full details in `docs/DECISIONS.md`):
- Netlify Free (commercial-OK), not Vercel Hobby (no-commercial ToS).
- Zoho Mail Free (5-user limit fits 4 mailboxes), not Google Workspace.
- Drop Upstash rate limit; keep in-memory fallback only.
- Keep Resend (branded auto-reply with brass stamp). No Formspree.
- Bold cutover (one-weekend full flip).
- Public email: `marketing@gemstalent.com.sg` (not `hello@`).
- No TypeScript / Redux / Redis / Cypress — all rejected with reasoning.

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
| 1   | Replace placeholder client/testimonial copy       | DDB, Edelman, Tiger Beer + both testimonial quotes still plausible filler. `data.js → clientGroups[]` + `testimonials[]`. **Deferred to post-launch.** |
| 3   | Run CDN download (Phase 0.5 of runbook)           | First action Claude Code takes. **Critical — do before deploy + before sunset.** |
| 6   | Distinct artiste portraits                        | Lawrence Wong + Theresa Carpio share an image. User to provide new images. **Deferred to post-launch.** |
| 7   | Real UEN                                          | Add to `data.js.contact.uen`; footer © line auto-includes it. **Deferred to post-launch.** |
| 8   | Real-device QA of responsive treatment            | After Phase 1 staging deploy — share `gemstalent.netlify.app` to phones. |
| 11  | Convert `api/enquiry.js` → Netlify Function       | Phase 2 of the runbook. Drop Upstash. |
| 12  | Refresh `docs/EMAIL_SETUP.md` for Netlify         | Phase 2 of the runbook. |
| 14  | Add `_redirects` to repo root before Phase 1      | Copy content from `docs/redirects.md`. **NEW.** |
| 15  | (Future) Create `hello@` on Zoho with forward     | ADR-007 future option. Polish, not launch-blocking. |

(Items 5, 9, 10 closed in prior sessions. Items 2, 4, 13 retired this session
— #2 folded into Phase 2 runbook task, #4 deferred until post-launch when
real photo lands, #13 verified done (no stragglers found in session 7
grep sweep).)

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
