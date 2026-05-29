# Starting your first Claude Code session

> **For:** the user, opening this repo in Claude Code CLI for the first time.
> **Purpose:** kick off Claude Code with the right context so it doesn't re-derive decisions or skip critical steps.

---

## Before you open Claude Code

Confirm:

- [ ] Repo is pushed to your private GitHub repo
- [ ] You can `git clone` it locally with no errors
- [ ] You're in the repo directory in your terminal
- [ ] You have `node` installed (check: `node --version` — any v18+)

---

## First prompt to give Claude Code

Paste this verbatim as your first message:

> Read `CLAUDE.md`, then `docs/handoff.md`, then `docs/DEPLOYMENT_RUNBOOK.md`, then `docs/DECISIONS.md`, in that order, before doing anything else. Don't make any changes yet — just confirm you understand the state, the locked decisions, and the deployment plan. Tell me what you'd do first.

Claude Code will read those four files and respond with its understanding of the project + a proposed first action.

**Expected response:** Claude Code should say something like:
> "I've read the handoff. The project is a static React site (Babel CDN) for GEMS Talent, a Singapore talent agency. There are 12 architectural decisions locked in `DECISIONS.md` — I'll honor them. The deployment runbook has 8 phases. The critical first action is Phase 0.5: run `node scripts/download-cdn-images.mjs --rewrite-data` to localize 17 CDN images BEFORE the WordPress site is sunset. Want me to start there?"

If it instead suggests adding TypeScript, rewriting components, or changing the deployment plan — push back. Point it at `DECISIONS.md` ADR-010 and `DEPLOYMENT_RUNBOOK.md`'s critical ordering section.

---

## Suggested session arc

You'll likely need 2–3 Claude Code sessions to complete the migration:

### Session 1 — Phases 0.5 → 2 (~2 hrs)
- Localize CDN images (Phase 0.5)
- Set up Netlify + staging deploy (Phase 1)
- Port form endpoint to Netlify Function (Phase 2)
- Refresh `docs/EMAIL_SETUP.md` to be Netlify-flavored

**End state:** site live at `gemstalent.netlify.app` with working form, all images local.

### Session 2 — Phases 3 → 5 (~1.5 hrs, mostly background sync)
- Zoho domain verification + mailboxes
- Add all upfront DNS records at Exabytes (Resend, Zoho, DMARC, GSC)
- Mbox backup
- Trigger Zoho IMAP migration (runs in background)
- Hand `docs/ZOHO_TEAM_SETUP.md` to the 4 staff members

**End state:** Zoho ready, mail migrated, staff devices configured (or in progress).

### Session 3 — Phases 6 → 8 (~1 hr active, 48 hrs monitor)
- DNS cutover (the moment of truth)
- Verify + monitor (24–48 hrs hands-off)
- Sunset Exabytes

**End state:** `gemstalent.com.sg` serves the new site, email flows to Zoho, Exabytes sunset planned.

---

## Things to bring up if Claude Code seems uncertain

If Claude Code asks "should I do X?" and X is in the runbook → point at the
runbook phase. If X isn't in the runbook → ping back to me (Claude design)
in your next design session rather than letting Claude Code freelance on
architecture.

Specifically, **always escalate to a design session for:**
- Component refactors
- Adding new pages
- Changes to `data.js` content shape (adding new fields to roster, etc.)
- Visual design questions (color, type, spacing)
- New animations or transitions

Claude Code's lane is **deployment + infrastructure + bug fixes + content
edits to existing fields**. Don't let it wander into design territory.

---

## When you're done with Claude Code

After your final Claude Code session:

1. Make sure `docs/handoff.md` is updated with a new "session N" entry covering what Claude Code accomplished. Either ask Claude Code to update it, or do it yourself.
2. Commit + push final state to GitHub.
3. When you next come back to Claude design, start a fresh project with the prompt:
   > "Read this GitHub repo: `https://github.com/<you>/<repo>`. Start by reading `docs/handoff.md`. We're picking up after Claude Code finished the deployment migration."

That re-establishes the design environment with full context.

---

## Open questions for Claude Code to verify or ask you

Anything below that's still uncertain at the start of a Claude Code session
should be the first thing Claude Code asks you about, before executing:

- [ ] Resend API key — paste in chat (will be stored as Netlify env var, never committed to git)
- [ ] Resend DNS records to add at Exabytes — confirm Claude Code has the full list before Phase 3
- [ ] Zoho mailbox passwords — Claude Code will create them, you choose them, save them in your password manager
- [ ] Final Resend `STAMP_URL` value — should be `https://gemstalent.com.sg/assets/gems-stamp-nav.jpg` after Phase 6 cutover. Until then, `https://gemstalent.netlify.app/assets/gems-stamp-nav.jpg` works for staging tests.
- [ ] Exabytes DNS records still in place at session start — confirm with `dig gemstalent.com.sg MX` before starting Phase 6

---

## What's open after deployment finishes

Once Phases 0.5 → 8 are complete, the project still has these open items
(deferred to future Claude design sessions, not blocking launch):

| # | Item | Why deferred |
|---|---|---|
| 1 | Real client logos / testimonial copy | Awaiting copy from user |
| 6 | Distinct portraits for Lawrence Wong + Theresa Carpio | Awaiting images from user |
| 7 | Real UEN in `data.js.contact.uen` | Awaiting from user |
| Future | Create `hello@gemstalent.com.sg` on Zoho with forward to `marketing@` | Optional polish, see ADR-007 |
| Future | Add analytics (Plausible / Fathom — not GA) | Post-launch, see "post-launch upgrades" in handoff |
| Future | Image optimization pass | Post-launch, after Lighthouse audit |

These come back to Claude design when you're ready.
