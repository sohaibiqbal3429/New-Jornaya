# Chatters Health Solutions Admin Panel

## Required environment variables (`.env.local`)

```bash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=chatters-health
ADMIN_EMAIL=admin@chatterhealthsolution
ADMIN_PASSWORD=your_strong_password
AUTH_SECRET=long_random_secret_for_signing_sessions
```

> Keep secrets only in `.env.local` (never commit them).

## Run locally

```bash
pnpm install
pnpm dev
```

Open:
- Website: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin`
- Admin dashboard: `http://localhost:3000/admin/dashboard`

## Features implemented

- Protected admin route with login/session cookie and middleware gating.
- Login rate limiting and generic invalid credential errors.
- Unified form submission API (`/api/forms/submit`).
- Admin APIs for listing, updating, deleting submissions.
- Live admin table refresh every 8 seconds.
- Filters/search, detail modal, status actions, and CSV export.

## Safe deployment notes

- Configure all env variables in your hosting provider dashboard.
- Rotate any previously exposed credentials before deploying.
- Use HTTPS in production so secure cookies are fully protected.
