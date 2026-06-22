# Blocked integrations: need your own credentials

Everything in this CRM works today without any third-party accounts beyond
Neon (database) and your own hosting. The items below are real upgrades the
codebase is ready to receive, but each needs an account and API key/secret
that only you can create — Claude Code cannot sign up for a service on your
behalf or invent credentials. Pick whichever are worth it; none are required
for the app to keep working as-is.

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

## 4. SMS fallback for 2FA (relevant to upcoming task #32)

Task #32 (TOTP 2FA) needs no external account — it's just an authenticator
app on the admin's phone. This entry only applies **if** you also want an
SMS-code fallback for admins who lose their authenticator device. Same
Twilio credentials as item 2 would cover it; no separate signup needed if
you already set up WhatsApp/SMS messaging above.

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

## Prerequisite for several of the above: a real production domain

Webhooks (task #30) already enforce `https://` receiver URLs. Email link
deliverability (item 1) and OAuth redirect URIs (item 5) both also need a
real deployed domain (Vercel's default `*.vercel.app` domain works fine for
all of these, a custom domain is not required). This isn't a credential by
itself, just noting it's a shared prerequisite once you deploy.
