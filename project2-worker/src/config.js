import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '..', '.env.local') });
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

function req(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return String(v).trim();
}

/** First non-empty URL among env keys; trailing slash stripped. */
function firstUrl(...keys) {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v.replace(/\/$/, '');
  }
  return '';
}

const targetFormUrl = firstUrl('TARGET_FORM_URL', 'FORM_BASE_URL', 'PROJECT1_BASE_URL');
if (!targetFormUrl) {
  throw new Error('Set TARGET_FORM_URL (or FORM_BASE_URL / PROJECT1_BASE_URL) for the Playwright form origin.');
}

const project1BaseUrl = firstUrl('PROJECT1_BASE_URL', 'TARGET_FORM_URL', 'FORM_BASE_URL') || targetFormUrl;

function isLocalhostOrigin(urlStr) {
  try {
    const { hostname } = new URL(urlStr.includes('://') ? urlStr : `http://${urlStr}`);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost')
    );
  } catch {
    return false;
  }
}

/** Oxylabs cannot reach your PC's localhost through the proxy; default off for local dev. */
const forcePlaywrightProxy = process.env.FORCE_PLAYWRIGHT_PROXY === 'true';
const skipProxyForLocalhost = process.env.SKIP_PROXY_FOR_LOCALHOST !== 'false';
const localhostTarget = isLocalhostOrigin(targetFormUrl);
const usePlaywrightProxy = forcePlaywrightProxy || !(localhostTarget && skipProxyForLocalhost);

export const config = {
  mongoUri: req('MONGODB_URI'),
  mongoDb: process.env.MONGODB_DB?.trim() || 'chatters-health',
  workerCount: Math.max(1, parseInt(process.env.WORKER_COUNT || '1', 10) || 1),
  batchSize: Math.max(1, parseInt(process.env.BATCH_SIZE || '10', 10) || 10),
  emptyQueueSleepMs: Math.max(
    1_000,
    Math.round(60_000 * (parseFloat(process.env.EMPTY_QUEUE_SLEEP_MINUTES || '1') || 1)),
  ),
  loopDelayMs: Math.max(0, parseInt(process.env.LOOP_DELAY_MS || '1000', 10) || 1000),
  oxylabsUser: req('userName'),
  oxylabsPass: req('password'),
  /** Origin used to open the landing form in Playwright (`…/#contact`). */
  targetFormUrl,
  /** Base URL for Project 1 HTTP APIs (axios). */
  project1BaseUrl,
  /** Sent as `x-api-key` on `createProject1Axios()` when set. */
  project1ApiKey: process.env.PROJECT1_API_KEY?.trim() || '',
  /** @deprecated use targetFormUrl */
  get formBaseUrl() {
    return targetFormUrl;
  },
  zipsDbPath: path.resolve(root, process.env.ZIPS_DB_PATH?.trim() || path.join('..', 'zips_lookup.db')),
  headless: process.env.HEADLESS !== 'false',
  workerLeaseMs: Math.max(60_000, parseInt(process.env.WORKER_LEASE_MS || '900000', 10) || 900_000),
  userAgent:
    process.env.PLAYWRIGHT_USER_AGENT?.trim() ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  /** When false, browser context has no proxy (e.g. localhost Next dev). */
  usePlaywrightProxy,
  localhostTarget,
  forcePlaywrightProxy,
};
