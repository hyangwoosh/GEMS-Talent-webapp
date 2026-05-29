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

## Phase 3 — Zoho Mail domain verification + mailbox creation

**Pre-condition:** none — Zoho setup can happen in parallel with Phases 1–2.

1. User signs up for **Zoho Mail Free** at `https://www.zoho.com/mail/`. Free plan supports up to 5 mailboxes per domain — fits the 4-mailbox setup.
2. **Add domain** `gemstalent.com.sg`. Zoho asks for a TXT verification record.
3. User adds the TXT record at Exabytes cPanel → **Zone Editor** → select `gemstalent.com.sg`. *(Safe additive record — does not affect existing email.)*
4. Wait ~10 min, click "Verify" in Zoho.
5. **Create 4 mailboxes** mirroring Exabytes:
   - `jojo@gemstalent.com.sg`
   - `marketing@gemstalent.com.sg`
   - `shinethw@gemstalent.com.sg`
   - `terence.tan@gemstalent.com.sg`
6. **Configure SPF/DKIM** — Zoho generates DKIM records during setup, gives user TXT records to add at Exabytes. Existing SPF should be amended to include Zoho (`v=spf1 include:zoho.com ~all`).
7. **DMARC** — Resend's record is already published. Leave it.

**DNS records to add upfront at Exabytes (all safe, all additive):**

Batch all of these in one Zone Editor session — they don't affect existing
email until MX records are cut over in Phase 6.

- Zoho TXT verification (from Zoho dashboard)
- Zoho DKIM TXT (from Zoho dashboard, after verification)
- Resend TXT, MX, DKIM (from Resend dashboard — user already has these listed)
- Resend DMARC: `_dmarc.gemstalent.com.sg` TXT = `v=DMARC1;p=none;sp=none;adkim=r;aspf=r;pct=100;fo=0;rf=afrf;ri=86400`
- Google Search Console verification TXT (from GSC dashboard — user has the value)
- Updated SPF: `gemstalent.com.sg` TXT = `v=spf1 include:zoho.com include:resend.com ~all` *(verify exact include directives in Resend + Zoho docs — they sometimes use a more specific subdomain)*

**Acceptance criteria:**
- [ ] All 4 mailboxes exist in Zoho
- [ ] User can log into webmail at `mail.zoho.com` with each mailbox
- [ ] All TXT records show as published in `dig gemstalent.com.sg TXT` (or mxtoolbox)

---

## Phase 4 — Mbox backup + IMAP migration

**Pre-condition:** Phase 3 mailboxes exist on Zoho.

### 4a — Mbox backup (belt-and-braces)

1. User installs **Thunderbird** (free, all platforms).
2. Add all 4 Exabytes mailboxes via **IMAP**:
   - IMAP server: `mail.gemstalent.com.sg` (or whatever Exabytes shows in cPanel → Email Accounts → Connect Devices)
   - Port: 993 (SSL/TLS)
   - Username: full email address
   - Password: mailbox password
3. Let Thunderbird fully sync — at 1.3 Gbps with ~1 GB of mail, ~5–10 min.
4. Install **ImportExportTools NG** add-on.
5. For each mailbox: right-click Inbox → ImportExportTools → Export folder → mbox.
6. Save all 4 mbox files to a folder named `gems-mail-backup-<date>/`. Zip + store somewhere safe (cloud drive, external disk).

**This backup is your insurance.** If anything goes wrong in 4b, you still have everything.

### 4b — Zoho IMAP migration

1. Zoho dashboard → **Migration** → **IMAP migration** (or "Mail migration").
2. Create a migration batch. Settings:
   - Source: Exabytes IMAP server (same details as Thunderbird above)
   - Destination: corresponding Zoho mailbox
3. Run sequentially for each of the 4 mailboxes. Zoho will copy folder structure + all mail.
4. **Volume:** `terence.tan@` has ~903 MB, `marketing@` has ~54 MB, others negligible. Total ~1 GB. At Zoho's import speed (~10–20 MB/min): 1–2 hrs background.
5. Monitor in Zoho dashboard. When all 4 batches show "Completed," proceed.

**Acceptance criteria:**
- [ ] Mbox backup zipped and stored safely
- [ ] All 4 Zoho mailboxes show full mail in webmail UI
- [ ] Spot-check: open 5 random messages in Zoho, confirm content matches Exabytes original

---

## Phase 5 — Team members set up devices

**Pre-condition:** Phases 3–4 complete.

User sends each of the 4 staff members `docs/ZOHO_TEAM_SETUP.md` (which
covers iOS Mail, Android Gmail app, Outlook, Apple Mail).

**Important:** during the cutover window, each team member should keep
**both** the Exabytes config AND the new Zoho config on their devices
simultaneously. After Phase 7 verifies stability, they remove the Exabytes
config.

**Acceptance criteria:**
- [ ] Each of 4 staff confirms they can send + receive on their devices via Zoho
- [ ] Each staff has Exabytes config still in place as fallback

---

## Phase 6 — DNS cutover (the moment of truth)

**Pre-condition:** Phases 1–5 complete and verified. **Do not start this on a Friday afternoon** — pick a low-traffic window where you can monitor for the next 24 hrs.

User logs into Exabytes registrar DNS panel.

**Records to update (existing values changing):**

| Type | Host | Old value | New value |
|---|---|---|---|
| A | `gemstalent.com.sg` | Exabytes IP | `75.2.60.5` (Netlify load balancer) |
| CNAME | `www` | Exabytes target | `gemstalent.netlify.app` |
| MX (priority 10) | `gemstalent.com.sg` | Exabytes mail server | `mx.zoho.com` |
| MX (priority 20) | `gemstalent.com.sg` | (varies) | `mx2.zoho.com` |
| MX (priority 50) | `gemstalent.com.sg` | (varies) | `mx3.zoho.com` |

*(Confirm Zoho's actual MX values in Zoho dashboard — they sometimes use region-specific endpoints.)*

**Records to leave in place** (added in Phase 3 — non-disruptive):
- All TXT records (SPF, DKIM, DMARC, Zoho verification, GSC verification)
- Resend MX (lives on a subdomain like `send.gemstalent.com.sg` — does not conflict)

**Propagation:** 5 min to 24 hrs depending on user ISP. Most users see new DNS within 30 min.

**Netlify-side:**
1. Netlify dashboard → Site settings → Domain management → Add custom domain → `gemstalent.com.sg` + `www.gemstalent.com.sg`.
2. Netlify checks DNS, confirms, provisions Let's Encrypt cert. ~10 min after DNS resolves.

**Acceptance criteria:**
- [ ] `dig gemstalent.com.sg A` returns Netlify IP
- [ ] `dig gemstalent.com.sg MX` returns Zoho MX records
- [ ] `https://gemstalent.com.sg` loads the new site with a valid HTTPS cert
- [ ] Send test email TO `marketing@gemstalent.com.sg` from a personal Gmail — arrives in Zoho within 5 min
- [ ] Send test email FROM `marketing@gemstalent.com.sg` via Zoho webmail to a personal Gmail — arrives within 5 min (check spam folder)

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

1. Each team member removes the Exabytes mail config from their devices (keeping only Zoho).
2. User backs up any remaining Exabytes files (cPanel → File Manager) — the WordPress site content. Download as zip, archive.
3. User contacts Exabytes support: **do not auto-renew** at next billing cycle, OR downgrade to email-only plan as a temporary safety window (~SGD 60–100/yr) if user wants extra paranoia time before fully cutting.
4. If cancelling outright: schedule cancellation for AFTER current billing period ends.
5. Update `docs/handoff.md` final session: mark migration complete.

**Money saved:** ~SGD 209/yr (full plan) → SGD 0 (full cancel) or ~SGD 80/yr (email-only fallback).

---

## Rollback plan (in case Phase 6 goes badly)

DNS changes are reversible — every record we change has its old value
documented in the table above. To rollback:

1. Revert MX records at Exabytes registrar to original values.
2. Revert A record to original Exabytes IP.
3. Wait for propagation. Mail and site flow back to Exabytes.
4. Mbox backup from Phase 4a preserves any mail that came in during the
   broken window — restore via IMAP push back to Exabytes if needed.

**Worst-case data loss:** mail that arrived during the broken window and
wasn't captured by either Zoho or Exabytes. Bounded by retry behavior of
sending servers (~24 hr typical retry window). Real loss: near-zero.

---

## Decision references (don't re-litigate)

See `docs/DECISIONS.md` for the full decision log. Quick summary:

| Decision | Why |
|---|---|
| Netlify, not Vercel | Vercel Hobby ToS prohibits commercial use. Pro is $20/mo. Netlify Free allows commercial. |
| Zoho, not Google Workspace | Free up to 5 users (fits 4-mailbox setup). Google would be ~SGD 460/yr. |
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
