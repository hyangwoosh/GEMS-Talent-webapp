# Deployment runbook — GEMS Talent

> **Audience:** Claude Code, executing this deployment with the user.
> **Goal:** Replace the live WordPress site at `gemstalent.com.sg` with the
> static React site in this repo, host it on Netlify, migrate email from
> Exabytes to Zoho. Cleanly sunset Exabytes after stability is verified.

---

## ⚠️ Critical ordering — read this before doing anything

The live React site loads 17 talent/work images from the WordPress CDN at
`gemstalent.com.sg/wordpress/wp-content/uploads/...`. Those URLs are hardcoded
in `data.js` via a `${CDN}/...` template.

**If Exabytes hosting is cancelled before those images are localized
(Phase 0.5), every talent portrait and work case-study image on the new
Netlify site breaks irrecoverably.**

The phase order below is not negotiable:

> **Phase 0** (repo) → **Phase 0.5** (localize CDN) → **Phase 1–2** (deploy to staging) → **Phase 3–5** (email setup) → **Phase 6** (DNS cutover) → **Phase 7** (verify stable, 24–48 hrs) → **Phase 8** (sunset Exabytes)

Do not skip ahead. Do not cancel Exabytes early.

---

## Pre-flight checklist — confirm before Phase 1

These are answers from the prior Claude design session. Confirm each is
still true at the start of your session:

- [ ] **Repo pushed to GitHub** and you have the URL. Confirmed in prior session.
- [ ] **Resend account exists**, API key generated, domain `gemstalent.com.sg` verified in Resend. Confirmed: yes, all done.
- [ ] **Exabytes admin access** — user can log into cPanel AND registrar DNS dashboard. Confirmed: yes.
- [ ] **Cutover style decided:** **Bold** — site + email DNS flipped together in one weekend. (Rationale: mailboxes aren't actively receiving live mail.)
- [ ] **Public-facing email:** `marketing@gemstalent.com.sg` (NOT `hello@`). `data.js` already updated.
- [ ] **Team Zoho setup:** each of the 4 staff sets up their own device. You provide them `docs/ZOHO_TEAM_SETUP.md` to follow.
- [ ] **WP redirect map:** see `docs/redirects.md`. Drop the contents of the `_redirects` block at `_redirects` in repo root before Phase 1 deploy.
- [ ] **Mbox backup:** scheduled as part of Phase 4. User has 1.3 Gbps download — full backup is ~5–10 min.
- [ ] **Pending content** (real client list, testimonials, UEN, distinct portraits for Lawrence Wong + Theresa Carpio) — deferred to post-launch sessions. Do not block deploy on these.

If any item above has changed, raise it before proceeding.

---

## Phase 0 — Repo state (assumed done)

Confirm before Phase 0.5:

```bash
git status                        # clean working tree
git log --oneline -3              # initial commit visible
git remote -v                     # points at user's private GitHub repo
```

If any of these fail, stop and ask the user.

---

## Phase 0.5 — Localize CDN images ⚠️ DO BEFORE DEPLOY

**Why:** see "Critical ordering" above.

**Pre-condition:** the WordPress site at `https://gemstalent.com.sg/wordpress/`
is still live and reachable. Verify by `curl -I` on any of the URLs in
`data.js`. If it returns 200, you're good.

**Execute:**

```bash
node scripts/download-cdn-images.mjs --dry-run    # confirm 17 URLs, no surprises
node scripts/download-cdn-images.mjs --rewrite-data
```

Expected output: `17/17 downloaded · data.js rewritten`.

**Verify:**

```bash
ls assets/cdn/ | wc -l           # 17
grep -c 'gemstalent.com.sg/wordpress' data.js   # 0 (was 17)
grep 'const CDN' data.js          # const CDN = "assets/cdn";
```

**Commit:**

```bash
git add assets/cdn data.js
git commit -m "Localize all 17 CDN images, switch data.js to local paths"
git push
```

**Test locally:**

```bash
npx serve .
# Open http://localhost:3000 — all talent portraits should still render.
# If any are missing, the WP site lost an image. Inspect Network tab.
```

---

## Phase 1 — Netlify staging deploy

**Pre-condition:** Phase 0.5 committed and pushed.

1. User signs into Netlify (or creates account — free tier, commercial use OK).
2. **Add new site → Import from Git → GitHub** → select repo.
3. **Build settings:**
   - Build command: *(leave blank)* — no build step
   - Publish directory: `.` (root)
4. **Deploy.** First build takes ~30s. You should get a `https://<random-slug>.netlify.app` URL.
5. **Rename** the site slug to `gemstalent` so the staging URL is `https://gemstalent.netlify.app`. (Site settings → Change site name.)

**Verify:**

```bash
curl -I https://gemstalent.netlify.app/
# Expect: HTTP/2 200, content-type: text/html
```

User opens the URL in a browser — every page should load, all images render (because they're now local), nav works, contact form *displays* (form submit will fail until Phase 2).

**Acceptance criteria:**
- [ ] Homepage loads, Tweaks panel opens
- [ ] All 7 site pages reachable via nav
- [ ] Talent portraits render
- [ ] OG card previews work (test by pasting URL in an OpenGraph tester)
- [ ] No 404s in browser DevTools Network tab

---

## Phase 2 — Convert form endpoint to Netlify Function

**Why:** `api/enquiry.js` is in Vercel format. Netlify Functions use a
different handler signature and folder convention.

**Steps:**

1. Create `netlify/functions/enquiry.js`. Port logic from `api/enquiry.js`:
   - Change handler signature from `export default async function handler(req, res)`
     to `exports.handler = async (event, context) => { ... }`
   - Replace `req.body` with `JSON.parse(event.body || "{}")`
   - Replace `res.status(n).json(obj)` with
     `return { statusCode: n, body: JSON.stringify(obj) }`
   - **Drop Upstash rate limiting entirely.** Keep only the in-memory
     fallback (function-instance-scoped Map). User's enquiry volume is
     <100/mo — Upstash is over-engineered. This was a locked decision in
     prior session (see `docs/DECISIONS.md`).
2. Create `netlify.toml` at repo root:

   ```toml
   [build]
     publish = "."
     functions = "netlify/functions"

   [[redirects]]
     from = "/api/enquiry"
     to = "/.netlify/functions/enquiry"
     status = 200
   ```

   The redirect keeps the existing `fetch('/api/enquiry')` call in
   `contact.html` working — no frontend change needed.
3. Delete `api/enquiry.js` (replaced by the new function). Update README and
   `CLAUDE.md` to point at `netlify/functions/enquiry.js` as the new
   single-source-of-truth for the form endpoint.
4. **Netlify env vars** — set in dashboard (Site settings → Environment variables):

   | Key | Value |
   |---|---|
   | `RESEND_API_KEY` | from Resend dashboard (user has it) |
   | `ENQUIRY_TO` | `terence.tan@gemstalent.com.sg` (until `talent@gems.sg` lives somewhere) |
   | `ENQUIRY_FROM` | `GEMS Talent <enquiries@gemstalent.com.sg>` |
   | `ENQUIRY_REPLY_TO` | (leave unset — defaults to `ENQUIRY_TO`) |
   | `STAMP_URL` | `https://gemstalent.netlify.app/assets/gems-stamp-nav.jpg` (or final domain after Phase 6) |

5. **Update `docs/EMAIL_SETUP.md`** to be Netlify-flavored, not Vercel-flavored (open item #12 from prior session).
6. **Trigger redeploy** to pick up new env vars.
7. **Test the form end-to-end:** submit a real enquiry on
   `gemstalent.netlify.app/contact`. Confirm:
   - Team notification arrives at `ENQUIRY_TO` mailbox
   - Auto-reply arrives at the address you submitted with
   - Brass stamp renders inline in the auto-reply

**Commit:**

```bash
git add netlify/ netlify.toml docs/EMAIL_SETUP.md README.md CLAUDE.md
git rm api/enquiry.js
git commit -m "Convert form endpoint to Netlify Function, drop Upstash"
git push
```

**Acceptance criteria:**
- [ ] Form submission returns 200
- [ ] Team notification email received
- [ ] Auto-reply email received with brass stamp visible
- [ ] No errors in Netlify function logs

---

## Phase 3 — Zoho Mail Lite setup + mailbox creation

> **Context (updated session 10):** Email source is Microsoft 365, not Exabytes cPanel.
> 3 active mailboxes confirmed: `christina@`, `marketing@`, `terence.tan@gemstalent.com.sg`.
> Zoho Free is unavailable for new custom-domain signups in SG — use **Zoho Mail Lite** ($1 USD/user/month, billed annually = $36/yr for 3 users).
> Site DNS already cut over (Phase 6 site portion complete). Phase 6 now covers MX-only cutover.

**Pre-condition:** none — can run in parallel with any remaining Phase 1–2 work.

1. Sign up for **Zoho Mail Lite** at `https://www.zoho.com/mail/`. Select "Mail Only" plan, Lite tier.
2. **Add domain** `gemstalent.com.sg`. Zoho provides a TXT verification record.
3. Add the TXT record in Exabytes DNS Zone Editor. *(Safe — additive, does not affect existing email or MX.)*
4. Wait ~10 min, click "Verify" in Zoho.
5. **Create 3 mailboxes** matching confirmed M365 accounts:
   - `christina@gemstalent.com.sg`
   - `marketing@gemstalent.com.sg`
   - `terence.tan@gemstalent.com.sg`
6. **Configure DKIM** — Zoho generates DKIM TXT records after domain verification. Add them at Exabytes Zone Editor.
7. **Update SPF** at Exabytes — amend existing SPF to include Zoho:
   - `gemstalent.com.sg` TXT = `v=spf1 include:zoho.com include:resend.com include:spf.protection.outlook.com ~all`
   - *(Keep the M365 SPF include until MX is fully cut over and M365 subscription cancelled.)*
8. **DMARC** — existing record stays. No change needed.

**DNS records to add (all additive, safe before MX cutover):**
- Zoho domain verification TXT (from Zoho dashboard)
- Zoho DKIM TXT (from Zoho dashboard)
- Updated SPF TXT (see step 7)

**Acceptance criteria:**
- [ ] All 3 mailboxes exist in Zoho
- [ ] Can log into `mail.zoho.com` with each mailbox
- [ ] Zoho DKIM + updated SPF published (verify at mxtoolbox.com/spf or similar)

---

## Phase 4 — Email backup + IMAP migration (M365 → Zoho)

**Pre-condition:** Phase 3 mailboxes exist on Zoho.

> **Source is M365, not Exabytes cPanel.** IMAP details below are for Microsoft 365.

### 4a — Backup (belt-and-braces)

1. Install **Thunderbird** (free, all platforms).
2. Add all 3 M365 mailboxes via IMAP:
   - IMAP server: `outlook.office365.com`
   - Port: 993 (SSL/TLS)
   - Username: full email address (e.g. `terence.tan@gemstalent.com.sg`)
   - Password: M365 account password
3. Let Thunderbird fully sync all folders.
4. Install **ImportExportTools NG** add-on.
5. For each mailbox: right-click Inbox → ImportExportTools → Export folder → mbox.
6. Save as `gems-mail-backup-<date>/`, zip, store safely (OneDrive, external disk).

**This backup is your insurance.** If migration fails, mbox files let you restore everything.

### 4b — Zoho IMAP migration

1. Zoho dashboard → **Migration** → **IMAP migration**.
2. For each of the 3 mailboxes, create a migration batch:
   - Source IMAP server: `outlook.office365.com`, port 993
   - Source credentials: M365 email + password
   - Destination: corresponding Zoho mailbox
3. Run all 3 batches. Zoho copies full folder structure + all mail.
4. Monitor in Zoho dashboard. When all 3 show "Completed," proceed.

**Acceptance criteria:**
- [ ] Mbox backup zipped and stored safely
- [ ] All 3 Zoho mailboxes show full mail history in webmail
- [ ] Spot-check: 5 random messages per mailbox match M365 originals

---

## Phase 5 — Staff devices reconfigured

**Pre-condition:** Phases 3–4 complete.

**First:** ask each of the 3 staff members what app they currently use to read `@gemstalent.com.sg` email (could be Outlook app, Gmail app, iPhone Mail, webmail — unknown until asked). Then provide IMAP credentials for that app.

**Zoho IMAP settings (same for all apps):**
- IMAP server: `imap.zoho.com`, port 993, SSL/TLS
- SMTP server: `smtp.zoho.com`, port 465, SSL/TLS
- Username: full email address
- Password: Zoho mailbox password (set during Phase 3 mailbox creation)

**Staff:** `christina@`, `marketing@`, `terence.tan@`

**Important:** during cutover window, keep M365 config active on devices as fallback. Remove M365 config only after Phase 7 (24–48 hr monitor) passes.

**Acceptance criteria:**
- [ ] Each of 3 staff confirms send + receive works on their device via Zoho
- [ ] M365 config still active as fallback until Phase 7 complete

---

## Phase 6 — DNS cutover

> **Site cutover COMPLETE (session 9).** `gemstalent.com.sg` resolves to Netlify. SSL active.
> This phase now covers **email MX cutover only** — swapping MX from M365 to Zoho.

**Pre-condition:** Phases 3–5 complete and verified. Pick a low-traffic window (not Friday afternoon) — you need to monitor for 24 hrs after.

**Do not cut MX until Phase 5 (staff devices on Zoho) is confirmed.** Once MX flips, new mail routes to Zoho. Anything staff haven't picked up in M365 won't auto-follow.

**Records to update at Exabytes Zone Editor:**

| Type | Host | Old value | New value |
|---|---|---|---|
| MX (priority 10) | `gemstalent.com.sg` | `gemstalent-com-sg.mail.protection.outlook.com` | `mx.zoho.com` |
| MX (priority 20) | `gemstalent.com.sg` | *(remove or replace)* | `mx2.zoho.com` |
| MX (priority 50) | `gemstalent.com.sg` | *(remove or replace)* | `mx3.zoho.com` |

*(Confirm Zoho's exact MX hostnames in Zoho dashboard → Domain Details → MX Records — may be region-specific.)*

**Records to leave in place:**
- A record → Netlify (already done)
- www CNAME → Netlify (already done)
- All TXT records (SPF, DKIM, DMARC, Zoho verification)
- Resend MX (subdomain — does not conflict)

**After MX update:** remove M365 SPF include from SPF record — `include:spf.protection.outlook.com` no longer needed once M365 is cancelled.

**Propagation:** 5–30 min typical. MX propagates faster than A records.

**Acceptance criteria:**
- [x] `dig gemstalent.com.sg A` returns Netlify IP *(done)*
- [x] `https://gemstalent.com.sg` loads new site with valid HTTPS *(done)*
- [ ] `dig gemstalent.com.sg MX` returns Zoho MX records
- [ ] Test email TO `marketing@gemstalent.com.sg` from personal Gmail → arrives in Zoho within 5 min
- [ ] Test email FROM `marketing@gemstalent.com.sg` via Zoho webmail → arrives in personal Gmail within 5 min (check spam)

---

## Phase 7 — Verify + monitor (24–48 hrs)

**Don't touch anything for 24–48 hrs.**

Watch for:
- Bounce notifications in any Zoho mailbox (would indicate a mail route problem)
- Reports from staff of missing email
- Netlify function errors in dashboard logs (Site → Functions → enquiry)
- Any 404s or broken images on the live site (`gemstalent.com.sg`)

**Zoho stragglers:** if Phase 4b ran during cutover, any mail that landed
at Exabytes after the import will sit there. Run Zoho's "incremental sync"
once more after 24 hrs to pull any stragglers. Then turn the sync off.

**Acceptance criteria:**
- [ ] 24 hrs elapsed with no mail-related issues reported
- [ ] At least 1 real inbound email + 1 real outbound email confirmed working per mailbox
- [ ] Form submission still works end-to-end on production URL
- [ ] No spike in Netlify function errors

---

## Phase 8 — Sunset Exabytes

**Pre-condition:** Phase 7 verified stable.

1. Each of 3 staff removes M365 config from their devices (keeping only Zoho).
2. Cancel M365 Business subscription — admin.microsoft.com → Billing → Your products → Cancel.
3. Back up any remaining Exabytes files (cPanel → File Manager) — WordPress site content. Download as zip, archive.
4. Disable Exabytes hosting auto-renew (next due 12/08/2026) — My Services → Request Cancellation.
5. Transfer domain from Exabytes → Cloudflare Registrar before cancelling hosting (need EPP/auth code from Exabytes, ~5 days). See handoff.md Exabytes exit plan.
6. Update `docs/handoff.md` final session: mark migration complete.

**Money saved:**
- M365: ~$227 USD/yr → Zoho Lite: ~$36 USD/yr = **$191/yr saved**
- Exabytes hosting: SGD 626.60 triennial → $0 after cancel

---

## Rollback plan (in case Phase 6 MX cutover goes badly)

Site rollback is no longer applicable — Netlify DNS is stable and correct.

**Email rollback only:**

1. Revert MX records at Exabytes to M365: `gemstalent-com-sg.mail.protection.outlook.com` (priority 10).
2. Wait for propagation (~5–30 min). New mail resumes routing to M365.
3. Mbox backup from Phase 4a preserves any mail received by Zoho during the broken window.

**Worst-case data loss:** mail received by Zoho after MX flip that staff haven't read yet. Retrieve from Zoho webmail manually. Sending servers retry for ~24 hrs — real loss near-zero.

---

## Decision references (don't re-litigate)

See `docs/DECISIONS.md` for the full decision log. Quick summary:

| Decision | Why |
|---|---|
| Netlify, not Vercel | Vercel Hobby ToS prohibits commercial use. Pro is $20/mo. Netlify Free allows commercial. |
| Zoho Mail Lite, not Google Workspace | $36/yr for 3 users vs ~$227/yr M365 or ~$216/yr Google. Email-only — no productivity suite needed. |
| Drop Upstash rate limit | Over-engineered for <100 enquiries/mo. In-memory fallback handles the volume. |
| Keep Resend (not Formspree) | Preserves branded auto-reply with brass stamp. |
| Bold cutover (one weekend) | Mailboxes aren't actively receiving mail — blip risk is effectively zero. |
| Public email = `marketing@` (not `hello@`) | `hello@` was a placeholder, doesn't exist. `marketing@` is real and exists. Future option: create `hello@` on Zoho with forward to `marketing@`. |
| No TypeScript / Redux / Redis / Cypress | All discussed and rejected — over-engineering for this site's scope. |

---

## What Claude Code should NOT touch

- **UI/UX design** — locked to the existing design system (see `CLAUDE.md`). Stays Claude design's domain. Any UI changes Claude Code spots as needed should be flagged to the user for a Claude design session.
- **Design tokens** — palette, typography, spacing, breakpoints.
- **Component structure** — don't refactor `components/*.jsx` for "best practices." The intentional tradeoff (zero build step, Babel-in-browser) is documented in `CLAUDE.md`.
- **The locked decisions in `docs/DECISIONS.md`** — these were debated and resolved. If you think one needs to change, raise it with the user; don't unilaterally update.
- **Content in `data.js`** — except for the `hello@ → marketing@` swap that's already landed, all content is canonical. Pending real content (clients, testimonials, UEN) is open item, not a Claude Code task.
