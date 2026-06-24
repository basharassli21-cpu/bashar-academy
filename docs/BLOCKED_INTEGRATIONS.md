# Blocked integrations: need your own credentials

Everything in this CRM works today without any third-party accounts beyond
Neon (database) and your own hosting. The items below are real upgrades the
codebase is ready to receive, but each needs an account and API key/secret
— or, for a couple of items near the end, a console setting or plan change —
that only you can create or authorize. Claude Code cannot sign up for a
service, invent credentials, or change your Neon/Vercel billing plan on your
behalf. Pick whichever are worth it; none are required for the app to keep
working as-is.

For each integration: what it unlocks today, what to sign up for, and the
env vars it would add to `.env` (same pattern as `DATABASE_URL`/`JWT_SECRET`
in `.env.example`).

## 1. Transactional email — highest impact

**Currently missing entirely.** There is no "forgot password" flow and no
email notifications — only the in-app bell (`src/components/notification-bell.tsx`).
If an admin forgets their password, the only recovery path today is someone
with direct database access running a manual password reset.

**Unlocks:** self-service password reset, optional email copies of
lead-assigned notifications, daily/weekly digest emails to team leaders.

**Get an API key from one of:** Resend, Postmark, or AWS SES (any SMTP-
compatible provider works; Resend has the simplest Next.js integration).

**Would add:**
```
RESEND_API_KEY="..."
EMAIL_FROM="Sales CRM <noreply@yourdomain.com>"
```
Needs a verified sending domain (DNS records) at whichever provider you pick.

## 2. WhatsApp Business / SMS automated messaging

**Currently:** click-to-call (`tel:`) and WhatsApp (`wa.me`) links open the
*employee's own* phone/WhatsApp app for them to send manually — no message
is ever sent by the server. That part already works with zero credentials
and isn't going away.

**Unlocks:** the server automatically sending a templated WhatsApp/SMS
message itself — e.g. an automatic "a sales rep will contact you shortly"
to a new lead, or an automatic reminder to a customer before a follow-up
date — without an employee touching their phone.

**Get credentials from:** Meta WhatsApp Cloud API (free tier, needs a Meta
Business account + phone number verification) or Twilio (paid, supports
both SMS and WhatsApp, easier signup).

**Would add:**
```
WHATSAPP_CLOUD_API_TOKEN="..."
WHATSAPP_PHONE_NUMBER_ID="..."
# or, for Twilio:
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_FROM="whatsapp:+1..."
```

## 3. Real push notifications (no paid account needed)

**Currently:** the notification bell polls `/api/notifications` every 30s —
only works while the tab is open. The PWA (task #29) has no push capability
yet.

**Unlocks:** OS-level push notifications even when the CRM tab/app is
closed, using the browser's standard Push API.

**No third-party account required** — this is the one item that's blocked
on *implementation work*, not a vendor signup. You generate your own VAPID
key pair locally:
```
npx web-push generate-vapid-keys
```
**Would add:**
```
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:you@yourdomain.com"
```
Flagged here anyway since it's still a credential-shaped prerequisite before
the feature could be built, and the keys must be generated and stored by you.

## 4. SMS fallback for 2FA (relevant to task #32 / #55)

TOTP 2FA (task #32, since extended to every role in task #55) needs no
external account — it's just an authenticator app on the user's phone. This
entry only applies **if** you also want an SMS-code fallback for users who
lose their authenticator device. Same Twilio credentials as item 2 would
cover it; no separate signup needed if you already set up WhatsApp/SMS
messaging above.

## 5. Calendar sync (Google Calendar / Outlook)

**Unlocks:** a lead's "next follow-up date" automatically creating/updating
an event on the assigned employee's calendar, instead of living only inside
the CRM.

**Get credentials from:** Google Cloud Console (OAuth client ID/secret,
Calendar API enabled) or Azure AD (for Outlook/Microsoft 365).

**Would add:**
```
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/auth/google/callback"
```
This is the most involved item on this list (per-user OAuth consent, token
storage/refresh) — lowest priority unless calendar sync is a specific ask.

## 6. Error monitoring (Sentry or similar)

**Unlocks:** automatic alerting when something throws in production,
instead of finding out from a user report. Not visible to end users at all.

**Get credentials from:** Sentry (generous free tier) or any APM provider.

**Would add:**
```
SENTRY_DSN="..."
```

## 7. CAPTCHA on the login form

**Currently:** `checkIpLoginRateLimit` and `checkAccountLoginRateLimit`
(`src/lib/auth/rate-limit.ts`) already cap failed attempts per IP and per
account, and the same limiter gates the 2FA code endpoint. That stops a
single attacker from brute-forcing one account quickly, but it doesn't stop
a *distributed* credential-stuffing run — many IPs, each staying under the
per-IP threshold, trying common passwords across usernames.

**Unlocks:** a visible/invisible challenge on the login form (and optionally
before 2FA verification) that's cheap for a human, expensive for a bot
farm — closing the gap rate-limiting alone leaves open.

**Get a site key + secret key from one of:** Cloudflare Turnstile (free,
privacy-friendly, simplest to self-host without a Google dependency),
hCaptcha (free tier), or Google reCAPTCHA v3.

**Would add:**
```
TURNSTILE_SITE_KEY="..."
TURNSTILE_SECRET_KEY="..."
```
(or the equivalent pair for whichever provider you pick). No domain
verification step beyond adding the domain in that provider's dashboard.

## 8. Neon Point-in-Time Recovery (PITR) window

**Different in kind from everything else on this page** — this isn't a
credential to add to `.env`, it's a setting in the Neon console (or a plan
upgrade) that only the account owner can change.

**Currently:** the app has row-level recovery — soft-delete/Trash for leads
(task #41) and the in-house audit log (task #38) — but no protection against
a *database-level* mistake (a bad migration, an accidental `DROP`, a botched
bulk operation run directly against the DB). Neon's free plan retains a
point-in-time restore window of a few hours by default; paid plans (Launch
and above) extend that to several days.

**What only you can do:** decide how much restore window you want and, if
that means moving off the free plan, upgrade the Neon project in the Neon
console — Claude Code has no access to your Neon billing/account settings
and shouldn't change them autonomously even if it could. Worth doing before
this CRM holds data you'd be unhappy to lose; not urgent if the current
Trash/audit-log coverage feels sufficient for now.

## Prerequisite for several of the above: a real production domain

Webhooks (task #30) already enforce `https://` receiver URLs. Email link
deliverability (item 1) and OAuth redirect URIs (item 5) both also need a
real deployed domain (Vercel's default `*.vercel.app` domain works fine for
all of these, a custom domain is not required). This isn't a credential by
itself, just noting it's a shared prerequisite once you deploy.
