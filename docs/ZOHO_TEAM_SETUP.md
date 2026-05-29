# Setting up your Zoho mail on your devices

> **For:** GEMS Talent staff (Jojo, Marketing, Shinethw, Terence).
> **Time:** ~10 min per device.
> **What's changing:** our email is moving from Exabytes to Zoho. Same address (`yourname@gemstalent.com.sg`), better webmail and mobile apps. New password.

---

## Before you start

You should have received from Terence:
1. **Your new password** for the Zoho mailbox.
2. **A heads-up of the cutover date** — set up Zoho a few days before so you're ready.

> **Important:** during the cutover window, **keep your old Exabytes mail account configured on your device too.** Don't delete it. You can remove it ~48 hrs after cutover once everything is verified working.

---

## Webmail (any device, no setup)

The easiest way to check mail:

1. Open `https://mail.zoho.com` in any browser.
2. Log in with your full email address (`yourname@gemstalent.com.sg`) and the password from Terence.

That's it. Use this as a fallback while setting up your phone/laptop.

---

## iPhone / iPad (Apple Mail)

1. **Settings** → **Mail** → **Accounts** → **Add Account**.
2. Tap **Other**, then **Add Mail Account**.
3. Fill in:
   - **Name:** your full name (shows on outgoing mail)
   - **Email:** `yourname@gemstalent.com.sg`
   - **Password:** the new Zoho password
   - **Description:** "Zoho" (or whatever you'll recognize)
4. Tap **Next**.
5. **IMAP** tab. Fill in:
   - **Incoming Mail Server**
     - Hostname: `imap.zoho.com`
     - Username: your full email
     - Password: your password
   - **Outgoing Mail Server**
     - Hostname: `smtp.zoho.com`
     - Username: your full email
     - Password: your password
6. Tap **Next** → **Save**.
7. Open Mail app. New account should appear. Send a test email to your personal address to confirm sending works.

---

## Android (Gmail app)

1. Open **Gmail** app → tap your profile photo top-right → **Add another account**.
2. Choose **Other**.
3. Enter your full email (`yourname@gemstalent.com.sg`) → tap **Next**.
4. Choose **Personal (IMAP)**.
5. Enter your password → **Next**.
6. **Incoming server settings:**
   - Username: your full email
   - Password: your password
   - Server: `imap.zoho.com`
   - Port: 993, security type: SSL/TLS
7. **Outgoing server settings:**
   - SMTP server: `smtp.zoho.com`
   - Port: 465, security type: SSL/TLS
   - Username + password: same as above
8. Account options: keep defaults (sync, notifications on).
9. Done. Send a test email.

---

## Desktop — macOS Mail

1. **Mail** menu → **Add Account** → **Other Mail Account**.
2. Fill in name, full email, password.
3. Click **Sign In**. macOS will probably auto-detect Zoho. If not, fill in manually:
   - Account type: **IMAP**
   - Incoming server: `imap.zoho.com`
   - Outgoing server: `smtp.zoho.com`
   - Username: full email, Password: your password
4. Choose what to sync (Mail at minimum) → **Done**.

---

## Desktop — Outlook (Windows or Mac)

1. **File** → **Add Account**.
2. Enter your full email → **Connect**.
3. Outlook may try Microsoft auto-config — wait, then choose **IMAP** when it fails.
4. Settings:
   - Incoming server: `imap.zoho.com`, port 993, encryption SSL/TLS
   - Outgoing server: `smtp.zoho.com`, port 465, encryption SSL/TLS
   - Username: full email, Password: your password
5. Test send/receive.

---

## Desktop — Thunderbird (Windows/Mac/Linux)

Use this if you want a free, no-frills email client.

1. **File** → **New** → **Existing Mail Account**.
2. Enter name, email, password → **Continue**.
3. Thunderbird auto-detects Zoho settings. If not:
   - Incoming: IMAP, `imap.zoho.com`, port 993, SSL/TLS
   - Outgoing: SMTP, `smtp.zoho.com`, port 465, SSL/TLS
4. **Done**.

---

## After cutover (Terence will let you know when)

Once Terence confirms the migration is verified stable (~48 hrs after cutover):

1. **Remove the Exabytes mail account** from your device:
   - **iOS:** Settings → Mail → Accounts → tap the old Exabytes account → **Delete Account**.
   - **Android Gmail:** Settings → tap account → Remove account.
   - **Outlook/Mac Mail/Thunderbird:** Account settings → select account → Remove.
2. Old mail history is **already migrated** to Zoho — you won't lose anything.

---

## Common problems

**"Cannot connect to server"** → check that your password is correct (no extra spaces), and that you used the exact server names: `imap.zoho.com` (not `mail.zoho.com`).

**"Authentication failed"** → ask Terence to reset your Zoho password in the Zoho admin console.

**"Mail received but can't send"** → outgoing (SMTP) server settings are wrong. Re-check `smtp.zoho.com`, port 465, SSL/TLS, AND that the username/password is the full email + password.

**Old emails missing** → wait. Mail migration runs in the background after cutover; large mailboxes can take an hour or two to fully sync. If still missing after 24 hrs, tell Terence.

---

## Need help?

Reply to the email Terence sent you. He'll either help directly or escalate.
