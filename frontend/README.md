# CareConnect Frontend

Standalone React + Vite frontend for CareConnect. It connects to the Express + MongoDB backend in `../backend`. The application is designed to run independently with the Express API in this repository.

## Setup

```bash
cp env.example .env
# Set VITE_CARECONNECT_API_URL=http://localhost:5001/api in .env
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). Keep the Express backend running on port 5001 in another terminal.

## Build

```bash
npm run build
```

## Backend contract

The API routes and request shapes are documented in `../docs/API_MAPPING.md`. The API base URL is read from `VITE_CARECONNECT_API_URL`. Access tokens are kept in memory; the refresh token is an HTTP-only cookie.
