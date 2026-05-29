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
