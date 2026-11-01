# Environment variables

## Backend — `backend/.env` (copy from `backend/env.example`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | yes | `development` / `production` |
| `PORT` | yes | Express port (default `5001`) |
| `CLIENT_ORIGIN` | yes | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | yes | Strong random string (use `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | yes | Different strong random string |
| `JWT_ACCESS_EXPIRES_IN` | no | default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | no | default `7d` |
| `JWT_REFRESH_COOKIE_NAME` | no | default `careconnect_refresh` |
| `COOKIE_SECURE` | no | `true` in production (HTTPS) |
| `COOKIE_SAMESITE` | no | `lax` (or `none` + Secure cross-site) |
| `OTP_LENGTH` / `OTP_TTL_MINUTES` / `OTP_RESEND_COOLDOWN_SECONDS` | no | defaults `6` / `10` / `60` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | prod | Email OTP. If `SMTP_HOST` empty, OTPs log to the console (`EMAIL_DEV_LOG=true`). |
| `EMAIL_DEV_LOG` | no | default `true` when no SMTP |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | no | Phone SMS OTP (optional) |
| `SMS_DEV_LOG` | no | default `true` |

## Frontend — `frontend/.env` (copy from `frontend/env.example`)

| Variable | Required | Description |
|---|---|---|
| `VITE_CARECONNECT_API_URL` | yes | Base URL of the backend, including `/api`. Local: `http://localhost:5001/api`. |

You can also set it at runtime for quick testing:
```js
localStorage.setItem("careconnect.api_base_url", "http://localhost:5001/api")
```
then reload.

## Generating secrets
```bash
openssl rand -hex 32
```
Never commit real secrets. `.env` is git-ignored.