# Starting a Claude Code session — GEMS Talent

> **For:** the user, opening this repo in Claude Code CLI.
> **Purpose:** kick off Claude Code with the right context so it doesn't re-derive decisions or skip critical steps.

---

## Current state (as of session 10)

**Done:**
- Phases 0–2: CDN images localized, Netlify deployed, form endpoint working
- Phase 6 (site): `gemstalent.com.sg` live on Netlify, DNS propagated, SSL active

**Remaining:**
- Phases 3–5: Zoho Mail Lite setup, M365 → Zoho migration, staff devices
- Phase 6 (email): MX cutover M365 → Zoho
- Phase 7: 24–48 hr monitor
- Phase 8: Cancel M365, disable Exabytes auto-renew, domain transfer

---

## Before you open Claude Code

Confirm:

- [ ] Repo cloned locally with no errors
- [ ] You're in the repo directory in your terminal
- [ ] You have `node` installed (`node --version` — any v18+)

---

## First prompt to give Claude Code

Paste this verbatim as your first message:

> Read `CLAUDE.md`, then `docs/handoff.md`, then `docs/DEPLOYMENT_RUNBOOK.md`, in that order, before doing anything else. Don't make any changes yet — confirm you understand the current state and what's remaining. Tell me what you'd do first.

Claude Code will read those files and respond with its understanding + proposed first action.

---

## Remaining session arc

### Next session — Phases 3 → 5 (~1.5 hrs, mostly background sync)
- Sign up Zoho Mail Lite, verify `gemstalent.com.sg` domain
- Create 3 mailboxes: `christina@`, `marketing@`, `terence.tan@gemstalent.com.sg`
- Add Zoho DKIM + updated SPF at Exabytes DNS
- Backup M365 mail via Thunderbird (mbox export)
- Run Zoho IMAP migration from `outlook.office365.com`
- Ask each of 3 staff what email app they use, send Zoho IMAP credentials

**End state:** Zoho ready, mail migrated, staff devices reconfigured.

### Following session — Phases 6 → 8 (~1 hr active, 48 hrs monitor)
- MX cutover at Exabytes: swap M365 MX → Zoho MX
- Verify + monitor 24–48 hrs
- Cancel M365 subscription
- Disable Exabytes hosting auto-renew
- Plan domain transfer Exabytes → Cloudflare

**End state:** email flows to Zoho, M365 cancelled, Exabytes exit in motion.

---

## Things to bring up if Claude Code seems uncertain

If Claude Code asks "should I do X?" and X is in the runbook → point at the runbook phase. If not → escalate to a design session, don't let Claude Code freelance on architecture.

**Always escalate to a design session for:**
- Component refactors
- New pages
- Changes to `data.js` content shape
- Visual design (color, type, spacing, animations)

Claude Code's lane: deployment, infrastructure, bug fixes, content edits to existing fields.

---

## Open questions for Claude Code to verify at session start

- [ ] Zoho mailbox passwords — decide them at account creation, save in password manager
- [ ] What email app does each staff member use? (ask before Phase 5)
- [ ] `STAMP_URL` env var in Netlify — update to `https://gemstalent.com.sg/assets/gems-stamp-nav.jpg` (open item #2)

---

## What's open after migration finishes

| # | Item | Notes |
|---|---|---|
| 5 | Real client logos / testimonial copy | Awaiting copy from user |
| 6 | Distinct portraits for Lawrence Wong + Theresa Carpio | Awaiting images |
| 7 | Real UEN in `data.js` | Awaiting from user |
| Future | `hello@gemstalent.com.sg` → forward to `marketing@` | Optional, create in Zoho |
| Future | Analytics (Plausible / Fathom — not GA) | Post-launch |
| Future | Image optimization pass | After Lighthouse audit |

These come back to Claude design when you're ready.
