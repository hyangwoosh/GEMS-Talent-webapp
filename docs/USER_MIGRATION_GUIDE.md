# Your migration guide — Exabytes → Netlify + Zoho

> \*\*For:\*\* you (Terence), the human doing the clicks, logins, and decisions.
> \*\*Companion to:\*\* `docs/DEPLOYMENT\_RUNBOOK.md` (which is written for Claude
> Code — the code + terminal work). This file is the \*user-facing\* view: what
> YOU handle at each phase, with realistic timing.
>
> \*\*Total hands-on time:\*\* \~3–4 hours, spread across 3 Claude Code sessions
> over a weekend, plus background waiting (mail sync, DNS propagation).

\---

## The one rule that matters most

**Order is everything:**

> localize images (0.5) → deploy (1–2) → email setup (3–5) → cutover (6) → verify (7) → \*\*only then\*\* cancel Exabytes (8)

If you cancel Exabytes before the images are localized, every talent photo on
the new site breaks and **cannot be recovered**. The old WordPress CDN goes
down with the Exabytes hosting.

\---

## Before you start anything

* \[ ] Push the handoff docs to GitHub (the commit prepared in the prior session)
* \[ ] Have these logins ready: **Resend**, **Exabytes** (cPanel + registrar/DNS), **GitHub**, a fresh **Netlify** signup, a fresh **Zoho** signup, **Google Search Console**
* \[ ] Have your **Resend API key** in your password manager
* \[ ] Block out a weekend where you can monitor for \~48 hrs after cutover

\---

# SESSION 1 — Get the site live on staging (\~2 hrs)

**Goal:** new site running at `gemstalent.netlify.app` with a working contact
form. **Nothing touches your real domain or email yet** — this is all safe.

## Phase 0.5 — Localize the images ⚠️ (Claude Code runs it, you watch)

* Claude Code runs the image-download script while your old WordPress site is still alive.
* **Your job:** confirm the talent photos still appear when Claude Code tests locally. If any are missing, tell it.
* **Why it matters:** this is the step that lets you safely kill Exabytes later. Don't skip it.

## Phase 1 — Netlify staging deploy (you click, \~20 min)

1. Sign up at **netlify.com** (free — use GitHub login for speed).
2. **Add new site → Import an existing project → GitHub** → pick your repo.
3. Build settings: leave build command **blank**, publish directory `.` (Claude Code confirms).
4. Deploy. You get a random URL like `wonderful-cat-123.netlify.app`.
5. **Site settings → Change site name →** rename to `gemstalent` so it becomes `gemstalent.netlify.app`.
6. Open it in your browser. Click through all 7 pages. Confirm images load, nav works.

## Phase 2 — Contact form backend (Claude Code codes, you paste env vars, \~30 min)

* Claude Code converts the form handler to a Netlify Function.
* **Your job:** in Netlify dashboard → **Site settings → Environment variables**, add:

|Key|Value|
|-|-|
|`RESEND\_API\_KEY`|your Resend key|
|`ENQUIRY\_TO`|`terence.tan@gemstalent.com.sg`|
|`ENQUIRY\_FROM`|`GEMS Talent <enquiries@gemstalent.com.sg>`|
|`STAMP\_URL`|`https://gemstalent.netlify.app/assets/gems-stamp-nav.jpg`|

* Then **trigger a redeploy** (Deploys → Trigger deploy → Deploy site).
* **Test:** submit the contact form on the staging site. Confirm you get the team notification email AND the auto-reply with the brass stamp.

**End of Session 1:** site works on staging, form sends real emails. Real domain + email untouched.

\---

# SESSION 2 — Set up Zoho + add all DNS records (\~1.5 hrs, mostly waiting)

**Goal:** Zoho mailboxes created, mail backed up + migrating, staff devices set
up. **Still safe — no cutover yet.**

## Phase 3 — Zoho domain + mailboxes (you do most of this, \~40 min)

1. Sign up at **zoho.com/mail** → choose the **Forever Free** plan.
2. **Add domain** `gemstalent.com.sg`.
3. Zoho gives you a **TXT verification record**. Add it in **Exabytes cPanel → Zone Editor** for `gemstalent.com.sg`. *(Safe — doesn't affect current email.)*
4. Wait \~10 min, click **Verify** in Zoho.
5. **Create your 4 mailboxes:** `jojo@`, `marketing@`, `shinethw@`, `terence.tan@`. Set passwords, save them in your password manager.
6. Zoho generates **DKIM records** — add those TXT records in Exabytes too.

## Add ALL remaining DNS records in one sitting (you, \~20 min)

While you're in the Exabytes Zone Editor, batch these in (all safe, all
additive — none affect live mail until cutover):

* **Resend records** (TXT, MX, DKIM) — from your Resend dashboard
* **DMARC** — `\_dmarc.gemstalent.com.sg` TXT = the Resend-provided value:
`v=DMARC1;p=none;sp=none;adkim=r;aspf=r;pct=100;fo=0;rf=afrf;ri=86400`
* **Google Search Console** TXT — the verification value GSC gave you
* **Updated SPF** — Claude Code gives you the exact combined value (something like `v=spf1 include:zoho.com include:resend.com \~all`)

## Phase 4a — Back up your old mail (you, \~15 min)

1. Install **Thunderbird** (free).
2. Add all 4 Exabytes mailboxes via IMAP (server details in cPanel → Email Accounts → Connect Devices).
3. Let it fully sync — at your 1.3 Gbps, \~5–10 min for \~1 GB.
4. Install the **ImportExportTools NG** add-on → export each mailbox as `.mbox` → zip and store safely.

> This is your insurance. If anything goes wrong, your mail is safe.

## Phase 4b — Migrate mail into Zoho (you start it, runs in background)

1. Zoho dashboard → **Migration → IMAP migration**.
2. Point it at your Exabytes IMAP server, run one batch per mailbox.
3. Walk away — \~1–2 hrs background. Check back when it says "Completed."

## Phase 5 — Staff set up their devices (each person, \~10 min)

* Forward `docs/ZOHO\_TEAM\_SETUP.md` to all 4 staff.
* Each adds Zoho to their phone/laptop using the new password you set.
* **Important:** they keep their OLD Exabytes config in place too, as a fallback during cutover.

**End of Session 2:** Zoho ready, all mail backed up + migrated, everyone's devices configured. Still nothing cut over.

\---

# SESSION 3 — Cutover + verify + sunset (\~1 hr active, then 48 hrs monitoring)

**Goal:** flip the real domain to the new site + new email. **This is the moment
of truth.** Do it on a quiet day where you can watch for 24–48 hrs after.

## Phase 6 — DNS cutover (you, \~30 min + propagation wait)

In your **Exabytes registrar/DNS panel**, change (Claude Code gives exact values):

|Type|Host|New value|
|-|-|-|
|A|`gemstalent.com.sg`|Netlify IP (`75.2.60.5`)|
|CNAME|`www`|`gemstalent.netlify.app`|
|MX (10)|`gemstalent.com.sg`|`mx.zoho.com`|
|MX (20)|`gemstalent.com.sg`|`mx2.zoho.com`|
|MX (50)|`gemstalent.com.sg`|`mx3.zoho.com`|

* **Leave all the TXT records** you added in Session 2 in place.
* Then in **Netlify → Domain management → Add custom domain** → `gemstalent.com.sg` + `www`. Netlify auto-issues the HTTPS certificate within \~10 min once DNS resolves.
* **Propagation:** usually 5–60 min. Be patient.

## Phase 7 — Verify + monitor (you, hands-off 24–48 hrs)

Test:

* \[ ] `https://gemstalent.com.sg` loads the new site with a padlock (HTTPS)
* \[ ] Send an email TO `marketing@gemstalent.com.sg` from your personal Gmail → arrives in Zoho
* \[ ] Send an email FROM Zoho webmail → arrives at your personal Gmail (check spam)
* \[ ] Submit the live contact form → notification + auto-reply both arrive
* \[ ] Old WordPress URLs redirect (e.g. `gemstalent.com.sg/wordpress/services/` → `/services`)

Then **don't touch anything for 24–48 hrs.** Watch for bounce emails or staff
reports of missing mail. If mail landed at Exabytes during cutover, run Zoho's
incremental sync once more after 24 hrs to pull stragglers, then turn it off.

## Phase 8 — Sunset Exabytes (you, only after Phase 7 is stable)

* Each staff member removes the old Exabytes config from their devices (keeping only Zoho).
* Download a final backup of the old WordPress files from cPanel → File Manager, archive it.
* Contact Exabytes: **set to not auto-renew**, OR downgrade to an email-only plan as a temporary safety net if you want extra paranoia time.
* ⚠️ **Do NOT cancel until Phase 0.5 was committed AND Phase 7 verified stable.** Once Exabytes hosting is off, the old WordPress CDN is gone forever.

**End:** `gemstalent.com.sg` serves your new React site, email flows to Zoho,
Exabytes cancellation scheduled. Migration complete.

\---

## Quick reference — who does what

|Phase|You handle|Claude Code handles|
|-|-|-|
|0.5|Confirm photos render|Run download script, rewrite data.js, commit|
|1|Netlify signup, import repo, rename site|Confirm build settings|
|2|Paste env vars, redeploy, test form|Convert form to Netlify Function, `\_redirects`|
|3|Zoho signup, mailboxes, DNS records|Provide exact record values|
|4a|Thunderbird backup|—|
|4b|Start Zoho IMAP migration|—|
|5|Forward setup guide to staff|—|
|6|DNS cutover at registrar, add domain in Netlify|Provide exact values|
|7|Send test emails, monitor 48 hrs|—|
|8|Remove old configs, schedule Exabytes cancellation|—|

\---

## If something goes wrong at cutover (rollback)

DNS changes are reversible. To roll back:

1. Revert the MX records at Exabytes to their original values.
2. Revert the A record to the original Exabytes IP.
3. Wait for propagation — mail + site flow back to Exabytes.
4. Your Phase 4a mbox backup preserves any mail that came in during the broken window.

Worst-case data loss is near-zero: sending servers retry for \~24 hrs, and your
backup captures the rest.

\---

## What's still open after migration (future Claude design sessions)

These don't block launch — come back to Claude design when ready:

* Real client logos + testimonial copy (`data.js`)
* Distinct portraits for Lawrence Wong + Theresa Carpio
* Real UEN in `data.js.contact.uen`
* (Optional) Create `hello@` on Zoho forwarding to `marketing@` — see `docs/DECISIONS.md` ADR-007
* (Optional) Analytics (Plausible / Fathom), image optimization, Lighthouse pass

