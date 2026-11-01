# Testing report

> Honest report. Tests are only marked "passed" when they were actually
> executed. Nothing here is claimed without being run.

## What was executed during this archive review

| Check | Command | Result |
|---|---|---|
| Backend syntax check (parse-only, all files) | `node --check` on every `.js` under `backend/` and `tests/` | **PASS — 50 files parsed** |
| Frontend syntax parse | TypeScript parser in JSX mode over frontend `.js`/`.jsx` files | **PASS — 121 files parsed** |
| Frontend local import resolution | Static check of relative and `@/` imports | **PASS — no unresolved imports** |
| Frontend production build | `npm run build` (Vite) | **NOT RE-RUN after the latest source edits** — run locally before submission |

## What could NOT be executed in the build environment

The review environment did not have project dependencies installed and could not reach the npm registry. The integration test suite is therefore **not executed** in this environment and must be run on your MacBook after installing dependencies.

The test suite is included and has been statically reviewed, but it has not been executed in this environment. Run it on your MacBook after installing dependencies.

## Running the tests on your MacBook

From the project root:
```bash
cd backend && npm install            # backend runtime deps
cd .. && npm install                 # test runner (jest, supertest, mongodb-memory-server)
npm test                             # runs the full integration suite
```

`npm test` spins up an **in-memory MongoDB** (`mongodb-memory-server`) — you do
not need a separate running MongoDB service or SMTP. The first test run may
download the MongoDB binary, so internet access may be required once. OTPs are captured from the
console log (the backend logs the code when `EMAIL_DEV_LOG=true`), so the
register → verify → login flow is exercised end-to-end with real, hashed,
single-use codes (no simulation, no accepted arbitrary OTPs).

## What the suite covers (`tests/`)

- **`auth.test.js`** — register, wrong-OTP rejection, correct-OTP verification,
  login after verification, unverified login blocked, role guard (donor cannot
  create a requirement), `/auth/me` shape, silent refresh via cookie (old token rejected, logout revokes new token),
  forgot + reset password (including email-scoped OTP and attempt limit).
- **`donation.test.js`** — organisation creates a requirement; donor donates;
  donor sees it in `/donations/mine`; org sees it in `/donations/received`;
  org advances status to `delivered`; requirement fulfillment updates; donor
  blocked from the admin donations list.
- **`volunteer.test.js`** — org posts an opportunity; volunteer applies;
  volunteer sees it in `/applications/mine`; org sees it in
  `/applications/received`; org accepts; status reflected for the volunteer;
  volunteer blocked from creating opportunities.
- **`admin.test.js`** — admin stats count users/organisations; non-admin
  blocked from admin stats; admin approves a pending organisation; CSV export
  returns `text/csv` with the expected header.

## Frontend build status

The original archive had a successful build before this review. The source has since been edited, so the current frontend build must be re-run locally with `cd frontend && npm install && npm run build`.

## Security items implemented (review, not auto-tested)

- bcrypt password hashing (cost 12).
- JWT access (15m) + httpOnly, SameSite refresh cookie (7d), stored as a SHA-256 hash, rotated on refresh, and revoked on logout/password changes.
- OTPs hashed (bcrypt), single-use, time-limited (10 min), resend cooldown
  (60 s), attempt cap (5).
- Role-based authorization on every protected route; admin-only admin routes.
- Rate limiting on auth + OTP endpoints.
- `forgot-password` returns a generic message (no email enumeration).

When you run `npm test` locally, paste any failures back and I will fix them.

## Current known limitations

- Email OTP is delivered only when SMTP is configured; otherwise it is logged in development mode.
- Phone OTP is available in Profile when Twilio is configured; otherwise the development code is logged by the backend.
- Organisation verification accepts HTTPS document links/references; direct file uploads are not implemented.
- Monetary donations are recorded as pledges in the application; no payment gateway is integrated.
- The three real-life photographs are loaded from Wikimedia Commons at runtime and are not bundled as local binaries in this archive. See `IMAGE_ATTRIBUTION.md`.
- Backend and frontend dependency installation, npm audit, the full integration test suite, and the updated frontend build must be run locally; they were not executable in this offline review environment.


## Dependency lockfiles

The frontend `package-lock.json` is included. The packaging environment could not reach the npm registry to generate the backend and root test-runner lockfiles. Run `npm install` once in `backend/` and once in the project root; npm will create those lockfiles locally.
