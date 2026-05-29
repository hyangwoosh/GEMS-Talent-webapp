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
- In Resend → **Domains** → **Add domain** → enter `gemstalent.com.sg`.
- Resend gives you DNS records (SPF, DKIM, DMARC) to add at your registrar. Add them, click "Verify" — usually takes <10 min.
- Once verified, you can send from anything @ that domain.

> If skipping for testing: Resend lets you send from `onboarding@resend.dev` immediately, but only to your own verified address.

### 3. Create an API key
- Resend → **API Keys** → **Create**. Copy the key (starts with `re_…`).

### 4. Site is deployed on Netlify
The function lives at `netlify/functions/enquiry.js`. A redirect in `netlify.toml`
maps `/api/enquiry` → `/.netlify/functions/enquiry`, so `contact.html` needs no change.

### 5. Set environment variables in Netlify
**Netlify dashboard → Project configuration → Environment variables → Add variable:**

| Key                | Value                                               | Required |
|--------------------|-----------------------------------------------------|----------|
| `RESEND_API_KEY`   | `re_…` (from step 3)                                | yes      |
| `ENQUIRY_TO`       | `terence.tan@gemstalent.com.sg`                     | yes      |
| `ENQUIRY_FROM`     | `GEMS Talent <enquiries@gemstalent.com.sg>`         | yes      |
| `ENQUIRY_REPLY_TO` | (leave unset — defaults to `ENQUIRY_TO`)            | no       |
| `STAMP_URL`        | `https://gemstalent.netlify.app/assets/gems-stamp-nav.jpg` (update to production domain after Phase 6) | recommended |

> `STAMP_URL` is the absolute public URL of the circular GEMS stamp used
> in email headers. Email clients block relative paths. Update to
> `https://gemstalent.com.sg/assets/gems-stamp-nav.jpg` after DNS cutover (Phase 6).

Trigger a redeploy after setting these so they take effect.

### 6. Done — submit a test enquiry
Open `contact.html` on the live Netlify URL, fill in the form. Within ~5 seconds you
should see two emails: one in `ENQUIRY_TO`, one in the address you submitted.

---

## What's wired up

```
netlify/
  functions/
    enquiry.js                       ← Netlify Function (POST handler)
netlify.toml                         ← Build config + /api/enquiry redirect
email-templates/
  team-notification.js               ← HTML email sent to your team
  auto-reply.js                      ← HTML "Enquiry received" sent to enquirer
email-preview.html                   ← Open this to preview both emails locally
contact.html                         ← Form POSTs to /api/enquiry (no change needed)
```

- Both templates use inline CSS (required for Gmail / Outlook).
- They carry the same palette as the site — cobalt, brass, mist.
- Auto-reply includes the enquirer's own message back so they have a receipt.
- Team notification has a one-click **Reply to [Name] →** button.
- Server-side validation: required fields, email format, 5000-char cap.
- Reply-To on the team notification = the enquirer's address.
- Rate limiting: 3/min · 10/hr per IP, in-memory (sufficient for <100 enquiries/mo).

---

## Costs (Resend, as of late 2025)

| Plan      | Price       | Emails / mo | Domains |
|-----------|-------------|-------------|---------|
| **Free**  | $0          | 3,000       | 1       |
| Pro       | $20 / mo    | 50,000      | 10      |

Two emails per enquiry → free tier covers **1,500 enquiries / month**.

---

## Want to edit the email copy?

Edit `email-templates/team-notification.js` and `email-templates/auto-reply.js`,
then open `email-preview.html` in your browser to preview instantly.
