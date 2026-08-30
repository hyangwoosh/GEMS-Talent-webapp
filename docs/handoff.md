# GEMS Talent — Session handoff (August 2026, session 14)

Singapore talent agency · **mid-rebuild** · legacy React site live at root, Astro 7 rebuild in `site/`

---

## State of the world right now

**Live site: `https://gemstalent.com.sg`** — unchanged, still the legacy React-via-Babel-CDN
build at repo root, still deploying to Netlify from `main`. **Nothing about the live site
changed this session.**

**Rebuild: in progress on `claude/repo-assessment-greenfield-v5d5d3`**, open as
[draft PR #1](https://github.com/hyangwoosh/GEMS-Talent-webapp/pull/1). Two commits, CI green.

**Why the rebuild:** a competitive review of nine Singapore and regional agencies found
every one of them has indexable per-artiste pages. GEMS has anchors on a single page, so
there is no surface for anyone searching an artiste by name. The cause is structural —
content is stored as presentation, so pages cannot be generated from it.

---

## What landed this session (session 14)

### Repo assessment + competitive review ✓
Nine agencies scraped and analysed: FLY Entertainment, NoonTalk, TCP Media, Artiste Co,
Hello Group, Haute, JRM Group, Scarlett, plus MN2S/UTA as booking-UX benchmarks.
Written up as an artifact (link in the session log; not committed).

Key gaps found: no per-artiste URLs, no client-attributed case studies, no awards or
credibility marks, no updates feed, no talent-recruitment path, no artiste socials, no
video, unoptimised imagery (a competitor on Wix serves AVIF; we ship 13 MB of raw JPEG),
no Chinese names, abstract service copy.

Worth protecting: the design is genuinely better than most of the field; credits are
structured rather than comma-strings; the enquiry endpoint already accepts an artiste tag
(built, untested in production, unused).

### Stack decided and recorded ✓
`docs/DECISIONS.md` gained a "Rebuild amendments — August 2026" section. ADR-001, 002 and
013 superseded; 004, 005 and 010 amended; ADR-015 (Sveltia CMS) and ADR-016 (analytics)
added. Original reasoning preserved per the amendment protocol.

### `CLAUDE.md` rewritten ✓
Three claims in it were wrong and would have misled the rebuild: an `api/` directory in
Vercel format (the function is at `netlify/functions/enquiry.js`), Upstash rate limiting
(dropped per ADR-005), and images still on the WordPress CDN (localised long ago).

### Astro scaffold ✓
`site/` — Astro 7.2.9, React 19, TypeScript strict. Scaffolded by hand; `create-astro`
cannot fetch its template from this environment. Build passes.

### Content model + migration ✓
`site/src/content.config.ts` defines five collections. `scripts/migrate-data-to-collections.mjs`
converted `data.js` into **4 artistes, 3 events, 18 clients, 4 services**.

The events count is the substance. `data.js` held the same engagements three times —
`featured[]` (5 display rows), hardcoded JSX in `work.html` (3 sections), and 3 gallery
arrays — with nothing keeping them in sync. Two featured rows were alternate crops of
engagements already listed. They now exist once each.

`artistes ↔ events` is a real many-to-many via `reference()`, resolving in both directions
from one set of links. Verified in the built output: every reference resolves.

### Design directions drafted ✓
Three whole-site directions on the locked palette, using real roster photography:
**A Broadsheet** (Bodoni Moda), **B Stage** (Big Shoulders, cobalt-deep, image-forward),
**C Index** (Instrument Sans, systematic). **Awaiting a decision — this blocks page templates.**

### Infrastructure provisioned ✓
Zoho CRM enabled (Enterprise trial), Telegram bot working, `sveltia-cms-auth` Worker
deployed to Cloudflare, `workers.dev` subdomain claimed as `gemstalent`.

---

## Open items

| # | Item | Priority | Notes |
|---|---|---|---|
| 1 | **Pick a design direction** | **Blocking** | A / B / C or a hybrid. Gates all page templates |
| 2 | **Zoho datacentre** | **Blocking the CRM adapter** | The domain at the API console — `.com` / `.eu` / `.in` / `.com.au` |
| 3 | **Zoho trial → Free on 12 Sep 2026** | High — dated | Enterprise trial expires. Lead payload uses only standard fields, so nothing should break, but verify after |
| 4 | Verify the 18 client names | High — needs user | All `verified: false`; none render until confirmed. See "the client copy problem" below |
| 5 | Real event dates | Medium | `data.js` carries a year only; migration set Jan 1. Needed for `Event` structured data |
| 6 | Real testimonials, or drop the section | Medium — needs user | The two live ones are anonymised to role + category |
| 7 | Real UEN | Medium — needs user | |
| 8 | Distinct artiste portraits | Medium — needs user | Lawrence Wong has no gallery images |
| 9 | Chinese names, Instagram handles, showreel URLs | Medium — needs user | Schema fields exist and are optional |
| 10 | Enable R2 in Cloudflare | Low | Only needed for the talent-submission upload feature |
| 11 | Regenerate the Zoho client secret | Low | Partially exposed in a screenshot during setup |
| 12 | Google Search Console | Low | Set up before cutover for before/after data |

---

## The client copy problem — read this before touching content

The live site names Marina Bay Sands, Mediacorp, Ogilvy, Edelman, DDB, Singapore Tourism
Board, Changi Airport Group, ONE Championship and Tiger Beer as clients. Both testimonials
are anonymised to role and category, which is the shape copy takes when it is written
rather than collected. Session 13's handoff already flagged this as placeholder, and it
shipped anyway.

The rebuild's `clients` schema defaults `verified` to `false` and the build will not render
an unverified name. That turns "remember to check the client list" into something enforced.
**Flip entries to `true` individually, only once someone confirms the engagement was real.**

---

## Infrastructure map

| Service | Provider | Plan | Cost | Status |
|---|---|---|---|---|
| Web hosting (live) | Netlify | Free | $0 | Active — until cutover |
| Web hosting (target) | Cloudflare Workers | Free | $0 | Not yet deployed |
| DNS | Cloudflare | Free, DNS-only | $0 | Active |
| Email (mailboxes) | Zoho Mail | Free, 3 users | $0 | Active |
| Enquiry store | Zoho CRM | Enterprise trial → Free 12 Sep | $0 | Provisioned, not wired |
| Team alerts | Telegram bot | — | $0 | Working |
| Transactional email | Resend | Free | $0 | Active, domain verified |
| CMS auth proxy | Cloudflare Worker | Free | $0 | `sveltia-cms-auth` deployed |
| Domain registration | Exabytes | Domain only | Renews 12/08/2026 | Active — `.com.sg` cannot transfer |
| Old hosting | Exabytes cPanel | — | — | CANCELLED (session 13) |
| Old email | Microsoft 365 | — | — | Cancelling on renewal |

**Monthly cost:** $0. Domain renewal annually.

---

## Repo layout

```
/                    LEGACY — live, do not break
  *.html             12 pages, React 18 UMD + @babel/standalone, no build
  data.js            frozen; migrate from it, don't extend it
  components/ styles/ netlify/functions/enquiry.js
  netlify.toml       publish "." — note this also publishes site/ on previews
  _redirects         17 WordPress → React rules (SEO, do not lose)

site/                REBUILD
  src/content.config.ts     five collections, Zod-validated
  src/content/              4 artistes · 3 events · 18 clients · 4 services
  src/assets/cdn/           images duplicated here so Astro can process them
  src/pages/index.astro     smoke test, not a design

scripts/migrate-data-to-collections.mjs    one-off, run once, kept for the record
```

---

## Next session

1. **Get the design decision**, then build the eleven page types.
2. Wire the enquiry endpoint once the Zoho datacentre is known: fan out to CRM +
   Telegram + Resend with `allSettled`, store first so an email failure cannot lose a lead.
3. Chase the content list (items 4–9). It has the longest lead time and needs people.

---

## Locked decisions (see `docs/DECISIONS.md` — do not re-debate)

- Astro 7 + TypeScript, static output, React islands (ADR-001-amended)
- Content collections, not `data.js` (ADR-002-amended)
- Cloudflare hosting after cutover; Netlify until then (ADR-004-amended)
- Zoho CRM + Telegram + Resend auto-reply, `allSettled` (ADR-005-amended)
- Sveltia CMS, not Keystatic — Keystatic caps at Astro 5 (ADR-015)
- Cloudflare Web Analytics (ADR-016)
- Palette and logo locked; typography is open until the direction is picked
- `.com.sg` stays at Exabytes — Cloudflare Registrar does not support the TLD
- Never edit legacy files to make the rebuild work

---

## DNS records (Cloudflare — unchanged this session)

| Type | Name | Content | Notes |
|---|---|---|---|
| A | `gemstalent.com.sg` | `75.2.60.5` | Netlify (DNS only) — changes at cutover |
| CNAME | `www` | `gemstalent.netlify.app` | Netlify (DNS only) |
| CNAME | `mail` | `gemstalent.com.sg` | Legacy |
| MX | root | `mx.zoho.com` [10] · `mx2` [20] · `mx3` [50] | Zoho |
| MX | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` [10] | Resend |
| TXT | root | `v=spf1 include:zohomail.com ~all` | SPF |
| TXT | root | `zoho-verification=zb393...` | Zoho verify |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC |
| TXT | `default._domainkey` · `resend._domainkey` | Resend DKIM | Resend |
| TXT | `zmail._domainkey` | Zoho DKIM | Zoho |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Resend SPF |
