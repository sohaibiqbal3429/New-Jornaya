# Project 2 Worker Service

This service fetches pending submissions from Project 1, processes them with Playwright, then updates Project 1 to mark those records verified.

## What It Does

- Fetches records from `GET /api/internal/submissions/pending` where `isVarified !== true`.
- Maintains an in-memory queue and runs `WORKER_COUNT` concurrent workers.
- Each worker processes one record at a time.
- On success, calls `POST /api/internal/submissions/verify` to mark the record verified.
- Writes JSONL logs to `logs/processing.jsonl`.

## Setup

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:
   - `npm install`
3. Install Playwright browser binaries:
   - `npx playwright install chromium`
4. Start the service:
   - `npm start`

## Console tracing

- **`WORKER_VERBOSE_LOG`** (default `true`): prints human-readable `[timestamp] [SCOPE]` lines for boot, API calls, queue, ZIP/proxy resolution, and every Playwright step. Set to `false` to reduce noise (JSONL `logEvent` lines still print).

## Oxylabs proxy (ZIP → IP)

- `zips_lookup.db` (repo root) has a `zips` table: column `url` stores a template line such as  
  `customer-USERNAME-cc-us-st-us_pennsylvania-city-scranton-sessid-replaceMe-sesstime-10:PASSWORD@pr.oxylabs.io:7777`.
- Set **`OXYLABS_USERNAME`** (or **`OXYLABS_SUBUSER`**) and **`OXYLABS_PASSWORD`** in `project2-worker/.env` or the repo-root **`.env.local`** (loaded last with override).
- For each pending lead, the worker reads the lead’s ZIP (and checks **phone area code** vs `phoneCode` in the DB row; mismatch only adds a warning).
- It substitutes `USERNAME` / `PASSWORD`, replaces `sessid-replaceMe` with a random session id when **`OXYLABS_ROTATE_SESSION`** is not `false`, and passes the result to Playwright as the browser proxy.
- If the ZIP is missing from the DB, set **`OXYLABS_PROXY`** to a full fallback line (same format).

Optional: **`ZIPS_LOOKUP_DB`** = absolute or cwd-relative path to the SQLite file (default: `../zips_lookup.db` next to `project2-worker`).

## Lead form / timeouts

- **`TARGET_FORM_URL`** must be reachable from the machine running the worker (same host as `PROJECT1_BASE_URL` is typical: `http://127.0.0.1:3000` or your public URL).
- **WSL:** `http://localhost:3000` points at the **Linux** side, not Windows where Next often runs. The worker rewrites `localhost` / `127.0.0.1` to the Windows host IP from `/etc/resolv.conf` unless **`WSL_LOCALHOST_REWRITE=false`**. You can also set `PROJECT1_BASE_URL` / `TARGET_FORM_URL` to `http://host.docker.internal:3000` or your LAN IP manually.
- **`TARGET_FORM_HASH=contact`** (default) opens `...#contact` so Playwright waits on the real lead form after client hydration.
- Increase **`FORM_WAIT_MS`** / **`NAVIGATION_TIMEOUT_MS`** when using slow residential proxies.
- **`userName` / `password`** in `project2-worker/.env` are read as Oxylabs credentials (same effect as `OXYLABS_USERNAME` / `OXYLABS_PASSWORD`). Prefer the `OXYLABS_*` names in docs; avoid relying on Windows’ unrelated `USERNAME` variable.

## Notes

- Authentication uses `PROJECT1_API_KEY`, sent as `x-api-key`.
- The service logs the worker id, fetched timestamp, input record id, and lead id mapping.
- The default IP logged is the system IPv4 address.
- To watch browser/network live, set:
  - `PLAYWRIGHT_HEADLESS=false`
  - `PLAYWRIGHT_DEVTOOLS=true`
  - Optional: `PLAYWRIGHT_SLOWMO_MS=250`
