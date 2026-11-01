# Deployment

## Local (your MacBook)
```bash
# 1. backend
cd backend
cp env.example .env          # set MONGODB_URI + JWT secrets
npm install
npm run seed                 # demo data (optional)

# 2. frontend
cd ../frontend
cp env.example .env          # set VITE_CARECONNECT_API_URL=http://localhost:5001/api
npm install
npm run dev

# 3. start the API (in another terminal)
cd ../backend && npm run dev
```
You need a MongoDB running locally (`mongodb://127.0.0.1:27017/careconnect`)
or a free MongoDB Atlas URI in `MONGODB_URI`. With no SMTP, OTPs print to the
backend terminal so you can register/verify/reset.

## Production
**Backend** — Render/Railway/Fly/your server. Set every `backend/.env` value in
the host's secret manager. `NODE_ENV=production`, `COOKIE_SECURE=true`, real
SMTP, real `JWT_*_SECRET`.

**Frontend** — `npm run build`, serve `dist/` with a static host and an SPA
fallback to `index.html`. Set `VITE_CARECONNECT_API_URL` to the production API
(e.g. `https://api.careconnect.org/api`) at build time.

## Cookies & CORS
- CORS: `origin` = exact frontend origin, `credentials: true`.
- Refresh cookie: `httpOnly`, `secure` (HTTPS), `sameSite: lax` (or `none` +
  Secure if frontend and API are on different sites).

## Post-deploy checklist
- [ ] `VITE_CARECONNECT_API_URL` correct and API reachable (`GET /api/health`).
- [ ] CORS allows the frontend origin with credentials.
- [ ] Refresh cookie httpOnly + Secure + SameSite.
- [ ] Real SMTP for OTP + reset emails.
- [ ] HTTPS enforced (so Secure cookies work).
- [ ] Run `npm test` before shipping.