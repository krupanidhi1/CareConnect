# Authentication & OTP

CareConnect accounts are owned entirely by this Express + MongoDB backend.
Passwords are hashed with bcrypt; sessions use JWT access tokens + an httpOnly
refresh cookie.

## Tokens
- **Access token** — short-lived JWT (default 15m), returned in the JSON body as
  `accessToken`, kept in frontend memory for the current page session, sent as
  `Authorization: Bearer`. Claims: `{ sub, role, careconnectRole }`.
- **Refresh token** — long-lived JWT (default 7d), stored ONLY in an httpOnly,
  SameSite cookie (`JWT_REFRESH_COOKIE_NAME`). Its SHA-256 hash is stored on the
  user record. Refresh checks the current hash, rotates it, and rejects the old
  cookie. Sent automatically because the frontend uses `withCredentials: true`.

## Registration → email OTP → session
1. `POST /auth/register` `{email,password}` — creates an **unverified** user
   (bcrypt-hashed password), issues a 6-digit OTP (hashed with bcrypt, TTL 10
   min, single-use), emails it. Returns `{message,userId}`. No session yet.
2. `POST /auth/verify-email` `{email,otp}` — verifies the OTP (hashed compare +
   expiry + attempt cap), sets `isVerified=true`, issues access + refresh,
   returns `{accessToken,user}`, sets the cookie.
3. `POST /auth/resend-email-otp` `{email}` — rate-limited; enforces a 60s
   resend cooldown server-side.

The frontend keeps the user on the OTP step until `verify-email` succeeds.
Wrong codes are rejected (400). Expired codes are rejected. Too many attempts
(>5) rejects and forces a resend.

## Login
`POST /auth/login` `{email,password}` — rejects unverified accounts with
`EMAIL_NOT_VERIFIED`; otherwise verifies the password, issues tokens.

## Refresh (silent)
`POST /auth/refresh` (cookie) — validates the refresh JWT against its stored
SHA-256 hash, mints a new access token and refresh JWT, stores the new hash,
rotates the refresh cookie, and rejects the previous cookie. Returns `{accessToken}`. The
frontend calls this automatically on any 401 and retries once.

## Logout
`POST /auth/logout` — revokes the current stored refresh-token hash and clears the refresh cookie.

## Profile / onboarding
`PATCH /auth/profile` — updates `fullName`, `phone`, `location`,
`careconnectRole`, `organizationName`. A user can choose a CareConnect role once during onboarding; it cannot be changed later through profile updates. Changing a phone number resets its verification flag. When `careconnectRole` becomes
`organization` and an `organizationName` is supplied, the backend creates the
`Organization` record owned by that user (so the org dashboard works).

## Phone OTP (optional)
`POST /auth/resend-phone-otp` `{phone}` → SMS via Twilio (or console log in
dev). `POST /auth/verify-phone` `{phone,otp}` → marks phone verified.

## Password reset (OTP-based)
1. `POST /auth/forgot-password` `{email}` — always returns a generic
   `{message}`. If the email exists, issues a reset code and sends it by email.
2. `POST /auth/reset-password` `{email,token,newPassword}` — verifies the
   email-scoped OTP using the same 10-minute expiry, single-use and five-attempt
   rules, hashes the new password, and clears the reset token. The frontend
   redirects to login.

## Change password
`POST /auth/change-password` `{currentPassword,newPassword}` — verifies
current, sets new, and revokes the current refresh session so the user must log in again.

## Roles
- `role`: `admin` (platform admin) or `user`.
- `careconnectRole`: `donor` | `organization` | `volunteer` (chosen in
  onboarding, nullable until then).
- Guards check `careconnectRole`; admins pass every guard.

## Security checklist
- bcrypt cost 12; passwords never returned.
- Refresh cookie httpOnly + SameSite (+ Secure in production).
- OTP hashed, single-use, TTL + cooldown + attempt cap.
- Rate limits on register/login/resend/forgot.
- No email enumeration in forgot-password.