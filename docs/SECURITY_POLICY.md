# Session & password policy

What this CRM does today around sessions and passwords, and why — written
after a deliberate review rather than left as accidental defaults.

## Session lifetime: 7 days, same for every role

Kept as-is on purpose. The alternative (a short admin-only session, e.g.
24 hours) was considered and rejected: it would force the admin to re-log-in
daily, which cuts directly against "comfortable for the admin" without
addressing the threat that actually matters here.

What protects a long-lived session instead:
- The session cookie is `httpOnly` + `secure` (production) + `sameSite=lax`
  — it can't be read by injected JS and isn't sent cross-site.
- Every request re-checks the live `User` row (`getCurrentUser` in
  `src/lib/auth/dal.ts`), not just the JWT claim — deactivating a user logs
  them out immediately regardless of how much of the 7 days is left.
- Changing a password now invalidates every *other* outstanding session for
  that account immediately (see below) — the main reason long-lived
  sessions are risky (a stolen-but-not-yet-noticed cookie outliving a
  password reset) is closed.
- 2FA (added alongside this review) is the right tool for "password leaked"
  — session duration is the wrong lever for that threat.

## Password change now actually invalidates old sessions

Before this review, changing or resetting a password (self-service or
admin-initiated) updated the password hash but left every previously-issued
JWT valid until its natural 7-day expiry — a stolen session would have
survived the exact action meant to shut it down.

Fixed with `User.sessionVersion`: included in every session JWT at issue
time, bumped by 1 on any password change. `getCurrentUser()` rejects a
token whose version doesn't match the live row. Applies to:
- Self-service change (`POST /api/auth/change-password`, any role)
- Admin resetting an employee's password (`PATCH /api/admin/employees/[id]`)

The tab that just changed the password gets a fresh cookie at the new
version in the same response, so it isn't logged out by its own action —
only *other* sessions are.

## Password requirements: length only, no forced rotation

Minimum length raised from 6 to 8 characters, applied uniformly to
employee creation, admin-initiated resets, and self-service change.

Deliberately **not** added:
- **Forced periodic rotation** (e.g. "change every 90 days"). Current NIST
  guidance (SP 800-63B) recommends against this — it pushes users toward
  predictable patterns (`Password1`, `Password2`, ...) and measurably
  doesn't improve security. Rotation should be triggered by suspected
  compromise, not a calendar.
- **Composition rules** (must contain a digit/symbol/uppercase). Same NIST
  guidance: these also push toward predictable patterns and length is the
  dominant factor in actual crack resistance.

## Self-service password change was missing entirely

Before this review, the *only* way any password could change was an admin
editing an employee/team-leader's record — there was no way for the admin
to change their own password short of direct database access. Added
`POST /api/auth/change-password` (current password + new password, any
authenticated role) with a UI entry point on `/admin/security`. Team Leader
and Sales Employee accounts now have the same entry point at
`/team-leader/security` and `/sales/security` respectively — both pages
render the same shared component, so password change and 2FA enrollment
are self-service for every role.

## Brute-force protection covers both factors

`checkAccountLoginRateLimit` (5 failed attempts / 15 min, keyed by user id)
already existed for password attempts and now also gates the 2FA code
endpoint — a 6-digit TOTP code is only ~1,000,000 possibilities, which is
brute-forceable in seconds without a limiter sharing the same budget as
password guesses.
