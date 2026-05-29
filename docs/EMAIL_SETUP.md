# GEMS Talent — Enquiry email setup

Self-hosted enquiry handling via **Resend**. Free up to 3,000 emails / month
(more than enough for a talent agency contact form). No third-party branding,
no monthly fee, mail comes from your own domain.

---

## What you need to do (one-time, ~20 minutes)

### 1. Create a Resend account
- Go to [resend.com](https://resend.com) → Sign up (free tier).
- No credit card required.

### 2. Verify your sending domain
- In Resend → **Domains** → **Add domain** → enter `gemstalent.com.sg`
  (or whatever domain you'll send mail from).
- Resend gives you 3 DNS records (SPF, DKIM, DMARC) to add at your domain
  registrar. Add them, click "Verify" — usually takes <10 min to propagate.
- Once verified, you can send from anything @ that domain
  (e.g. `enquiries@gemstalent.com.sg`, `marketing@gemstalent.com.sg`).

> If you want to skip this for testing: Resend lets you send from
> `onboarding@resend.dev` immediately, but only to your own verified
> address. Fine for a sanity-check; not fine for production.

### 3. Create an API key
- Resend → **API Keys** → **Create**. Copy the key (starts with `re_…`).
- You'll paste it into your hosting platform's env vars in step 5.

### 4. Pick a host and deploy
The function in `api/enquiry.js` works out of the box on **Vercel**.
For other hosts, see the comment block at the top of that file.

**Recommended: Vercel** (free, takes 2 minutes)
- Push this project to GitHub (or any git remote).
- [vercel.com](https://vercel.com) → New Project → Import the repo.
- Framework preset: **Other**. Build command: leave blank. Output: `.`
- Click Deploy.

### 5. Set environment variables on your host
In Vercel → Project → Settings → **Environment Variables**, add:

| Key                | Value                                                | Required |
|--------------------|------------------------------------------------------|----------|
| `RESEND_API_KEY`   | `re_…` (from step 3)                                 | yes      |
| `ENQUIRY_TO`       | `talent@gems.sg`                                     | yes      |
| `ENQUIRY_FROM`     | `GEMS Talent <enquiries@gemstalent.com.sg>`          | yes      |
| `ENQUIRY_REPLY_TO` | `talent@gems.sg` (optional, defaults to ENQUIRY_TO)  | no       |
| `STAMP_URL`        | `https://gemstalent.com.sg/wp-content/uploads/gems-stamp-nav.jpg` | recommended |

> `STAMP_URL` is the absolute public URL of the circular GEMS stamp used
> in the "ink" email header preset. Email clients block relative paths,
> so the asset must live on a publicly fetchable URL. The template falls
> back to `https://gemstalent.com.sg/wp-content/uploads/gems-stamp-nav.jpg`
> if the variable is unset — upload the stamp there (or override the var)
> before going live.

Redeploy after setting these so they take effect.

### 5a. (Optional) Shared rate limit via Upstash Redis

The endpoint ships with a per-IP rate limit (3/min, 10/hour) that defaults to
an in-memory `Map`. That map resets on cold start and isn't shared across
regions — fine for casual scrapers, weak against real abuse. To pin the
counter to a shared, persistent store, add an Upstash Redis instance:

- [upstash.com](https://upstash.com) → **Create database** → Redis →
  any region (closest to your Vercel function region). Free tier is plenty.
- In the database overview, copy the **REST URL** and **REST Token**.
- In Vercel → Settings → Environment Variables, add:

| Key                          | Value                              |
|------------------------------|------------------------------------|
| `UPSTASH_REDIS_REST_URL`     | `https://….upstash.io`             |
| `UPSTASH_REDIS_REST_TOKEN`   | `AX…` (REST token, not CLI password) |

`api/enquiry.js` auto-detects both vars and routes the limiter through
Upstash via its REST pipeline (one HTTP call per request). If Upstash is
unreachable, the endpoint **fails open** to the in-memory map rather than
locking real users out. Set both vars to switch on; unset to switch off.

### 6. Done — submit a test enquiry
Open `contact.html` on your live URL, fill in the form. Within ~5 seconds you
should see two emails: one in talent@gems.sg, one in the address you used.

---

## What I built for you

```
api/
  enquiry.js                       ← Serverless endpoint (POST handler)
email-templates/
  team-notification.js             ← HTML email sent to your team
  auto-reply.js                    ← HTML "Enquiry received" sent to enquirer
email-preview.html                 ← Open this to preview both emails
contact.html                       ← Form now POSTs to /api/enquiry
```

- Both templates use inline CSS (required for Gmail / Outlook).
- They carry the same palette as the site — cobalt, brass, mist, bone.
- Auto-reply includes the enquirer's own message back so they have a receipt.
- Team notification has a one-click **Reply to [Name] →** button.
- Server-side validation: required fields, email format, 5000-char cap.
- Reply-To header on the team notification = the enquirer's address, so
  hitting "Reply" in your inbox goes straight back to them.

---

## Costs (Resend, as of late 2025)

| Plan      | Price       | Emails / mo | Domains |
|-----------|-------------|-------------|---------|
| **Free**  | $0          | 3,000       | 1       |
| Pro       | $20 / mo    | 50,000      | 10      |

Two emails per enquiry → free tier covers **1,500 enquiries / month**.
You will not hit this.

---

## Want to edit the email copy?

The templates are plain JS files that return an HTML string. Edit the strings
in `email-templates/team-notification.js` and `email-templates/auto-reply.js`,
then open `email-preview.html` in your browser to see the result instantly.

The receipt card, signature, studio address block, and reply-by promise
("two working days") are all directly editable in the auto-reply template.
