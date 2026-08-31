# Architecture decision record — GEMS Talent

> Locked decisions from the Claude design sessions that produced this repo.
> If you (Claude Code, or future Claude design session) think one of these
> needs to change, **raise it with the user first**. Don't unilaterally
> revisit — these were debated explicitly and resolved.

---

## ADR-001 — Build-step-free React (Babel CDN, in-browser transpile)

**Decision:** React 18 + JSX, with Babel Standalone transpiling in the browser at page load.

**Rejected alternatives:**
- TypeScript + build step (e.g. Vite)
- Next.js / Astro / SvelteKit
- Pre-compiled JSX → JS at deploy time

**Why:**
- This is a 7-page brochure site for a boutique talent agency. Build steps add complexity disproportionate to the scope.
- Iteration speed in Claude design depends on "edit a file → reload browser." A build step kills that.
- Tradeoff: ~150 KB Babel + ~10 ms transpile per page load. Acceptable for low-traffic editorial use.

**When to revisit:** if (a) the site grows past ~30 components, or (b) page-load metrics start mattering for SEO/conversion.

---

## ADR-002 — `data.js` as single source of content

**Decision:** All page content (roster, services, clients, copy, contact info) lives in one global `window.GEMS_DATA` object in `data.js` at repo root.

**Rejected alternatives:**
- Per-page JSON files
- Headless CMS (Contentful, Sanity, etc.)
- Markdown files + frontmatter

**Why:**
- "Where does X come from?" should have ONE answer.
- Editorial content for a brochure site changes monthly at most — no CMS required.
- One file means one place to grep, one merge conflict surface, one diff to review.

**When to revisit:** if content updates start happening weekly+ and require a non-developer editor.

---

## ADR-003 — Project structure: HTML at root, components in `components/`, styles in `styles/`, docs in `docs/`

**Decision:** Folder structure documented in `CLAUDE.md` § "Project layout."

**Why:**
- HTML at root → clean URLs (`/about`, not `/pages/about`).
- `components/` and `styles/` → conventional, easy to find.
- `docs/` → keeps reference material out of the visible repo surface.
- `CLAUDE.md`, `README.md`, `.gitignore`, `data.js` stay at root because their consumers (Claude, GitHub, git, every HTML page) look for them there.

**When to revisit:** never. The structure is conventional for this stack.

---

## ADR-004 — Hosting: Netlify, not Vercel

**Decision:** Static site on **Netlify Free** + Netlify Function for the form endpoint.

**Rejected alternatives:**
- Vercel Hobby (free) → **rejected:** ToS prohibits commercial use; needs Pro at $20/mo for a business site.
- Vercel Pro → rejected: $20/mo for a brochure site is unjustified.
- Exabytes cPanel + PHP form handler → rejected: locks form logic into PHP, gives up CDN performance.
- Cloudflare Pages → viable alternative, equally valid. Netlify picked for built-in form features as future fallback.

**Why:**
- Netlify Free explicitly allows commercial use.
- Global CDN, automatic Let's Encrypt SSL, function support, GitHub auto-deploy.
- Form fallback option (Netlify Forms) exists if Resend ever becomes a problem.

**When to revisit:** if traffic exceeds Netlify's 100 GB/mo or 125k function invocations/mo (not happening for this site).

---

## ADR-005 — Form backend: Resend + Netlify Function (no Formspree, no Upstash)

**Decision:**
- Resend handles email delivery (team notification + branded auto-reply with brass stamp).
- Logic runs as a Netlify Function (`netlify/functions/enquiry.js`).
- Rate limiting via in-memory fallback only — **Upstash REST dropped**.

**Rejected alternatives:**
- Formspree → rejected: loses the branded auto-reply (their templates are generic).
- Web3Forms / Basin → same as Formspree.
- Keep Upstash → rejected: over-engineered for <100 enquiries/mo. Function-instance-scoped Map handles burst protection.

**Why:**
- Branded auto-reply with brass GEMS stamp is a meaningful design touch — worth the Resend setup.
- Resend has a generous free tier (3000 emails/mo).
- Upstash's value is multi-instance shared rate limit state. At this scale, that's overkill.

**When to revisit:** if enquiry volume exceeds ~500/mo (then reconsider Upstash) or Resend free tier becomes limiting.

---

## ADR-006 — Email hosting: Zoho Mail Free, not Google Workspace

**Decision:** Zoho Mail Free for all 4 staff mailboxes.

**Rejected alternatives:**
- Google Workspace Business Starter (SGD 9.60/user/mo ≈ SGD 460/yr for 4 users)
- Microsoft 365 Business Basic (SGD 8.10/user/mo)
- Fastmail ($5/user/mo)
- Migadu ($9/mo flat unlimited)
- Stay on Exabytes mail → rejected: middling deliverability, dated webmail UX.

**Why:**
- Zoho Free covers up to 5 mailboxes per domain on a custom domain — fits the 4-mailbox setup exactly.
- Reliable deliverability, decent mobile apps, calendar included.
- SGD 0/yr vs SGD 460/yr.

**When to revisit:** if staff count grows past 5, or if a specific Google/MS integration becomes essential.

---

## ADR-007 — Public-facing email: `marketing@gemstalent.com.sg`

**Decision:** `data.js.contact.email` is `marketing@gemstalent.com.sg`.

**Background:** earlier sessions used `hello@gemstalent.com.sg` as a sensible-looking default, but no such mailbox existed. Discovered during the Exabytes mailbox audit.

**Why this resolution:**
- `marketing@` is a real, existing mailbox.
- Avoids creating an extra Zoho mailbox during migration (preserves 1 of 5 free slots).
- Simple, no forwarding rules to maintain.

**Future option (not blocking):** create a real `hello@` mailbox on Zoho post-migration and configure it to forward to `marketing@`. Then change `data.js.contact.email` back to `hello@`. This was the user's preferred end-state — preserved here so it's not forgotten.

---

## ADR-008 — Cutover strategy: bold (one-weekend full flip)

**Decision:** Site DNS + email MX records flip together in one weekend.

**Rejected alternative:** cautious approach (site first, monitor 5–7 days, then email).

**Why:**
- Mailboxes are not actively receiving live mail at time of migration (confirmed by user).
- "Email blip" risk during MX propagation is effectively zero without live mail flow.
- Cautious mode adds 1+ weeks of dual-config maintenance for negligible safety gain.

**When to revisit:** N/A — decision applies to this migration only.

---

## ADR-009 — Backup: mbox snapshot before cutover

**Decision:** Full mbox backup of all 4 Exabytes mailboxes via Thunderbird IMAP sync + ImportExportTools NG add-on, immediately before Phase 6 (DNS cutover).

**Why:**
- Belt-and-braces. Costs ~5–10 min at user's 1.3 Gbps connection.
- Provides rollback path if Zoho's migration importer drops messages.
- Mail is irreplaceable; backup is cheap. Asymmetric risk/cost favors backup.

---

## ADR-010 — Don't add TypeScript, Redux, Redis caching, or Cypress E2E

**Decision:** Reject all four for this project.

**Why:**
- **TypeScript:** kills the zero-build-step model that enables Claude design iteration speed. Site has no API contracts complex enough to justify it.
- **Redux:** total state = 3 booleans (drawer open, tweaks panel state, form fields). Redux on this codebase would be 200 lines of boilerplate for 3 useState calls.
- **Redis caching:** nothing to cache. No DB, no expensive computations. Rate-limiting use case discussed under ADR-005.
- **Cypress:** half-day setup + ongoing test maintenance for a 7-page site that changes monthly. Manual QA on real devices catches more for less.

**When to revisit:** these are scale-driven decisions. If the project ever becomes a real app (auth, DB, dynamic content), reopen.

---

## ADR-011 — Image hosting: local in `assets/cdn/` (CDN localization)

**Decision:** All 17 talent/work images downloaded from WordPress CDN to `assets/cdn/`, served alongside the site. Script: `scripts/download-cdn-images.mjs --rewrite-data`.

**Why:**
- Self-contained repo. No external dependency on the old WP site staying alive.
- Required before sunsetting Exabytes (see Deployment Runbook Phase 0.5).
- Total size <10 MB — well within Netlify's bandwidth allowance.

**When to revisit:** if total image weight grows past ~100 MB, consider moving to a dedicated image CDN (Cloudinary, imgix). Not needed at current scale.

---

## ADR-012 — Reverse-proxy `/api/enquiry` → `/.netlify/functions/enquiry`

**Decision:** During Phase 2 conversion, add a Netlify redirect rule in `netlify.toml`:

```toml
[[redirects]]
  from = "/api/enquiry"
  to = "/.netlify/functions/enquiry"
  status = 200
```

**Why:** keeps `fetch('/api/enquiry')` in `contact.html` working unchanged. Frontend code doesn't need to know it's on Netlify. Portable abstraction.

**Tradeoff:** one extra DNS hop. Negligible (<5 ms).

---

## ADR-013 — Static gallery arrays in data.js (no Array.from)

**Decision:** `rwsGallery` and `chrizGallery` are explicit static arrays, not `Array.from()` generators.

**Why:**
- `Array.from()` generates URLs at runtime — any tooling that statically analyzes `data.js`
  (download scripts, grep, linters) silently misses the generated URLs.
- The original script captured the raw JS expression (`Chriz-Tong-${String(i+1)...}`) as
  a malformed URL and would have blocked `--rewrite-data`.
- Static arrays are easier to read, grep, and diff.
- No behavioral change — same images, same order.

**When to revisit:** never for this scale. If gallery grows past ~50 images, consider a
separate data file.

---

## ADR-014 — Exabytes exit order: email → domain transfer → DNS → cancel hosting

**Decision:** When cancelling Exabytes, the order is non-negotiable:
1. Migrate email first (Zoho Lite or Migadu) — flip MX
2. Transfer domain to Cloudflare Registrar
3. Move DNS to Cloudflare during transfer
4. Cancel Exabytes hosting only after domain transfer confirmed + DNS stable

**Why:**
- Domain is registered through Exabytes (expires 12/08/2026). Cancelling hosting
  before transferring the domain risks losing DNS resolution for the entire domain.
- Email is on Microsoft 365 (MX → `gemstalent-com-sg.mail.protection.outlook.com`),
  not Exabytes mail — so email migration is separate from web hosting cancellation.
- Cloudflare Registrar is free (ICANN cost only) and gives permanent DNS independence.

**Zoho Free plan note:** No longer available for new custom-domain signups in Singapore
as of May 2026. Use Zoho Mail Lite (SGD ~80/yr for 4 users) or Migadu (USD 9/mo flat).

---

## Decision-amendment protocol

If you (future Claude Code or Claude design session) need to revisit a decision:

1. **Don't** silently update code in a way that contradicts an ADR.
2. **Do** raise it with the user explicitly: "ADR-N says X. New consideration: Y. Recommend updating ADR-N to Z?"
3. If the user agrees, append a new entry to this file with `ADR-N-amended` and the new reasoning. Don't delete the old reasoning — keep the history.

---
---

# Rebuild amendments — August 2026

> The site is being rebuilt from scratch on Astro. The ADRs below are amended or
> superseded by that decision. Original reasoning is preserved above per the
> amendment protocol; nothing has been deleted.
>
> Context: the rebuild was triggered by a competitive review of nine Singapore and
> regional talent agencies. Every one of them has indexable per-artiste pages;
> GEMS has anchors on a single page. That gap is structural, not visual — content
> is stored as presentation (a display array for the hero rotator, hardcoded JSX
> sections for the work page, string keys standing in for relationships that
> nothing validates), so pages cannot be generated from it.

## ADR-001-amended — Astro 7 with a build step

**Supersedes ADR-001** (build-step-free React via Babel CDN).

**Decision:** Astro 7 + TypeScript, static output, React islands for the interactive parts.

**Why the original reasoning no longer holds:**
- ADR-001's own revisit trigger has fired: *"if page-load metrics start mattering for
  SEO/conversion."* They do. Buyers search for artistes by name, and the site has no
  per-artiste URL to land them on.
- The site ships React **development** builds plus `@babel/standalone` and transpiles
  JSX in the browser on every page load, for every visitor. The 150 KB / 10 ms estimate
  in ADR-001 was optimistic by roughly an order of magnitude.
- 13 MB of unoptimised JPEG. A competitor running on Wix serves AVIF at responsive
  sizes; Astro's image pipeline closes that gap with no manual work.
- "Edit a file → reload browser" is preserved by Vite HMR, which is faster than the
  full reload the original setup required.

**Rejected alternatives:**
- **Next.js 16** — a server framework for an 8-page brochure site. ADR-004 already
  rejected Vercel on commercial-ToS grounds, and off-Vercel Next is second-class.
  Next 16 also carries a heavy security-patch cadence for a site with no login and
  no database.
- **React Router v8** — a good framework, but router-first: no zero-JS path, and
  everything renders through React. Worse for SEO-critical marketing pages.
- **TanStack Start** — stable and popular as of 2026, but SPA-first and explicitly
  weaker for content-heavy public sites.
- **Eleventy** — viable, but no component islands and a weaker image story.

**When to revisit:** if authenticated per-user state arrives (client portal, artiste
login, live availability calendar). Then run Astro for the marketing site and a
separate app framework on a subdomain — not one framework straining to do both.

---

## ADR-002-amended — Content collections replace `data.js`

**Supersedes ADR-002** (`window.GEMS_DATA` as single source).

**Decision:** Zod-validated Astro content collections — `artistes`, `events`,
`services`, `clients`, `updates` — one file per record.

**Why:**
- The single-source principle in ADR-002 was right; the implementation could not hold it.
  There are currently **three unsynchronised representations of the same five events**:
  `featured[]` for the hero rotator, hardcoded JSX sections in `work.html`, and three
  separate gallery arrays.
- Relationships are string keys with nothing validating them. `roster[].relatedWork` is
  `"rws-exclusive-showcase"` — a plain string pointing at a `<section id>`. Rename the id
  and the link dies silently in production.
- The artiste ↔ event relationship is many-to-many. `relatedWork` is a single string, so
  it structurally cannot express an artiste with two events. That ceiling is already
  present in the data.
- Under collections, a broken `reference()` fails the build instead of shipping.

---

## ADR-004-amended — Hosting: Cloudflare Workers

**Amends ADR-004** (Netlify, not Vercel). The anti-Vercel reasoning is unchanged and
still stands.

**Decision:** Cloudflare Workers, static output with two on-demand routes.

**Why:**
- DNS is already on Cloudflare, so this consolidates a vendor rather than adding one.
  Turnstile, Web Analytics and R2 all live in the same account.
- Cloudflare acquired the Astro team in January 2026, making Astro-on-Cloudflare
  first-party.
- Static asset requests are unmetered on the free plan, versus Netlify's 100 GB/month.
- Migration cost is near zero *during the rebuild* — the enquiry function is being
  rewritten anyway, and the DNS change is one A record. It would be a poor trade as a
  standalone migration.

**Note:** Netlify Free explicitly permits commercial use and remains a valid fallback.
This is consolidation, not a fix for a problem.

---

## ADR-005-amended — Enquiry fan-out: Zoho CRM + Telegram + Resend

**Amends ADR-005** (Resend + Netlify Function).

**Decision:** the enquiry endpoint fans out via `Promise.allSettled` to:
1. **Zoho CRM Free** — the lead record, and the source of truth
2. **Telegram bot** — instant team alert
3. **Resend** — the branded auto-reply to the enquirer

**Why:**
- The current function has no store at all. If Resend throws, it returns 502 and **the
  enquiry is lost permanently** — no retry, no queue, no record. That is the actual
  defect being fixed; the vendor choices follow from it.
- The two Resend sends are currently sequential `await`s. Fanning out in parallel
  roughly halves response time.
- **The team notification email is dropped.** Once CRM holds the record and Telegram
  pushes the alert, it is a third copy of the same information landing in an inbox
  nobody files.
- **Resend is kept for the auto-reply only** — nothing else in the stack can send it.
  Cloudflare Email Routing is inbound-forwarding only; Zoho CRM Free excludes workflow
  automation; Zoho Mail free-tier SMTP is restricted and sending programmatically from a
  staff mailbox risks that mailbox's reputation.
- Zoho CRM Free adds **no new vendor** — same account as the mailboxes — and its 3-user
  ceiling matches the three mailboxes exactly.

**Constraints to respect:**
- Zoho CRM Free excludes custom fields. The lead payload must map only to standard
  fields: `Last_Name`, `First_Name`, `Email`, `Phone`, `Company`, `Description`,
  `Lead_Source`.
- `Lead_Source` is a picklist. `"Website"` is **not** a valid value out of the box —
  either add it to the picklist or use an existing entry.
- The org is on an Enterprise trial until **12 September 2026**, after which it
  downgrades to Free. Anything built on trial-only features will break that day.

**Rejected:** Airtable (adds a vendor; 1,000 API calls/month is a monthly ceiling),
Cloudflare D1 (no UI — the people who need this data are not technical), Google Sheets
(no pipeline), Supabase (free tier pauses when idle).

---

## ADR-010-amended — TypeScript is in

**Amends ADR-010** (no TypeScript, Redux, Redis, or Cypress).

**Decision:** TypeScript, strict. The rejections of Redux, Redis and Cypress stand.

**Why:** TypeScript arrives free with Astro content collections — the Zod schema *is* the
type. The ADR-010 objection was to ceremony without payoff; here the payoff is that a
missing portrait or a malformed slug fails the build instead of rendering a blank card,
which is the exact class of bug the handoff has been tracking as an open item.

---

## ADR-013-amended — Gallery arrays become collection fields

**Supersedes ADR-013** (static gallery arrays, no `Array.from`).

**Decision:** galleries are `z.array(image())` fields on the artiste and event records.

**Why:** the concern in ADR-013 was static analysability — that generated URLs are
invisible to tooling. Collections satisfy that more strongly: images are resolved and
validated at build time, and a missing file fails the build.

---

## ADR-015 — Sveltia CMS, not Keystatic

**Decision:** Sveltia CMS for the browser-based editing UI.

**Why not Keystatic** (the first choice):
- `@keystatic/astro` declares peer dependencies for Astro `2 || 3 || 4 || 5`. It does not
  support Astro 6, and its admin UI crashes with React hook errors there. Astro 7 is
  further out still. Using it would mean pinning Astro 5.

**Why Sveltia:**
- Decap CMS (the incumbent git-based option) is no longer actively maintained. Sveltia is
  its actively-developed successor — drop-in config compatibility, ~300 KB bundle,
  stronger i18n, several hundred longstanding Decap issues fixed.
- **Framework-agnostic.** It is a static admin page talking to the Git provider, with no
  peer dependency on Astro. It cannot break when Astro majors — which is precisely what
  disqualified Keystatic, and Astro is now on a yearly major cadence.
- Git-based, so it adds no vendor and no cost.

**Cost:** GitHub auth needs an OAuth proxy — `sveltia-cms-auth` deployed as a Cloudflare
Worker, in the account already in use. Removable if GitHub ships client-side PKCE for
this flow.

**Priority:** optional. The CMS exists so non-technical staff can edit content; a
developer editing MDX directly needs none of it. Defer until someone else has to edit.

---

## ADR-016 — Analytics: Cloudflare Web Analytics

**Decision:** Cloudflare Web Analytics at launch. PostHog later if funnel data is wanted.

**Why:** free, unlimited, cookieless — which sidesteps the consent question entirely —
and it is in the account already holding DNS and hosting. GA4 rejected: consent burden
and a hostile UI for a site this size.

**The metric that matters** is not pageviews. It is *artiste page view → enquiry click →
submit*, per artiste, which tells the team which names are actually in demand. Nothing in
the current site can produce that number.
