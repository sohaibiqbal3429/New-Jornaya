import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { rewriteLocalhostForWsl, defaultChromiumArgsForRuntime } from './resolve-local-url.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(projectRoot, '..');
const cwdEnvPath = path.resolve(process.cwd(), '.env');
const projectEnvPath = path.resolve(projectRoot, '.env');
const repoEnvLocalPath = path.resolve(repoRoot, '.env.local');

if (fs.existsSync(projectEnvPath)) {
  dotenv.config({ path: projectEnvPath, override: true });
}
if (fs.existsSync(cwdEnvPath)) {
  dotenv.config({ path: cwdEnvPath, override: true });
}
if (fs.existsSync(repoEnvLocalPath)) {
  dotenv.config({ path: repoEnvLocalPath, override: true });
}
if (!fs.existsSync(projectEnvPath) && !fs.existsSync(cwdEnvPath)) {
  dotenv.config();
}

function readNumber(name, fallback) {
  const value = Number(process.env[name] || fallback);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const project1BaseUrlRaw = (process.env.PROJECT1_BASE_URL || 'http://localhost:3000').trim();
const targetFormUrlRaw = (process.env.TARGET_FORM_URL || 'https://chattershealthsolutions.com').trim();

export const config = {
  project1BaseUrlRaw,
  project1BaseUrl: rewriteLocalhostForWsl(project1BaseUrlRaw),
  project1ApiKey: process.env.PROJECT1_API_KEY || '',
  batchSize: readNumber('BATCH_SIZE', 100),
  workerCount: readNumber('WORKER_COUNT', 8),
  emptyQueueSleepMinutes: readNumber('EMPTY_QUEUE_SLEEP_MINUTES', 3),
  loopDelayMs: readNumber('LOOP_DELAY_MS', 1000),
  leadIdWaitMs: readNumber('LEADID_WAIT_MS', 6000),
  preSubmitWaitMs: readNumber('PRE_SUBMIT_WAIT_MS', 0),
  /** Max wait for lead form (hydration + proxy). */
  formWaitMs: readNumber('FORM_WAIT_MS', 90000),
  /** page.goto timeout (proxies can be slow). */
  navigationTimeoutMs: readNumber('NAVIGATION_TIMEOUT_MS', 120000),
  targetFormUrlRaw,
  targetFormUrl: rewriteLocalhostForWsl(targetFormUrlRaw || 'https://chattershealthsolutions.com'),
  /** Appended as #fragment when URL has no hash (scrolls to contact form on one-pager). */
  targetFormHash: (process.env.TARGET_FORM_HASH ?? 'contact').trim(),
  playwrightIgnoreHttpErrors: `${process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS || 'true'}`.toLowerCase() !== 'false',
  /** Extra launch args (WSL/Docker: --no-sandbox). Override with PLAYWRIGHT_CHROMIUM_ARGS="--a --b". */
  playwrightChromiumArgs: (() => {
    const raw = (process.env.PLAYWRIGHT_CHROMIUM_ARGS || '').trim();
    if (raw) return raw.split(/\s+/).filter(Boolean);
    return defaultChromiumArgsForRuntime();
  })(),
  playwrightHeadless: `${process.env.PLAYWRIGHT_HEADLESS || 'true'}`.toLowerCase() !== 'false',
  playwrightDevtools: `${process.env.PLAYWRIGHT_DEVTOOLS || 'false'}`.toLowerCase() === 'true',
  playwrightSlowMoMs: Number(process.env.PLAYWRIGHT_SLOWMO_MS || 0),
  playwrightUserAgent: process.env.PLAYWRIGHT_USER_AGENT || '',
  defaultZipCode: process.env.DEFAULT_ZIP_CODE || '',
  /**
   * Oxylabs sub-user (replaces USERNAME in zips_lookup `url` template).
   * Also reads `userName` / `password` from .env for convenience (do not use Windows env USERNAME).
   */
  oxylabsUsername: (
    process.env.OXYLABS_USERNAME ||
    process.env.OXYLABS_SUBUSER ||
    process.env.userName ||
    ''
  ).trim(),
  oxylabsPassword: (process.env.OXYLABS_PASSWORD || process.env.password || '').trim(),
  /** Full fallback line if ZIP missing or not in DB: customer-...:pass@pr.oxylabs.io:7777 */
  oxylabsProxyFallback: (process.env.OXYLABS_PROXY || '').trim(),
  oxylabsRotateSession: `${process.env.OXYLABS_ROTATE_SESSION || 'true'}`.toLowerCase() !== 'false',
  /** Absolute or cwd-relative path to SQLite DB; default repo root zips_lookup.db */
  zipsLookupDbPath: (() => {
    const v = (process.env.ZIPS_LOOKUP_DB || '').trim();
    if (!v) return '';
    return path.isAbsolute(v) ? v : path.resolve(process.cwd(), v);
  })(),
  selectors: {
    form: process.env.FORM_SELECTOR || 'form',
    firstName: process.env.FIELD_FIRSTNAME_SELECTOR || 'input[name="firstName"]',
    lastName: process.env.FIELD_LASTNAME_SELECTOR || 'input[name="lastName"]',
    email: process.env.FIELD_EMAIL_SELECTOR || 'input[name="email"]',
    phone: process.env.FIELD_PHONE_SELECTOR || 'input[name="phone"]',
    zipCode: process.env.FIELD_ZIPCODE_SELECTOR || 'input[name="zipCode"]',
    consent: process.env.FIELD_CONSENT_SELECTOR || 'input#leadid_tcpa_disclosure',
    submit: process.env.SUBMIT_SELECTOR || 'button[type="submit"]',
  },
};

if (!config.project1ApiKey) {
  throw new Error('PROJECT1_API_KEY is required.');
}
