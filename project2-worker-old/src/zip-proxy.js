import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { config } from './config.js';
import { extractZipCode, extractUsAreaCode, zipForDbLookup } from './zip-code.js';
import { debugLog, debugPreviewProxyUser } from './debug-console.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(workerRoot, '..');
const require = createRequire(import.meta.url);

/** In-memory DB (sql.js WASM) — avoids native `better-sqlite3` ABI mismatches across Node versions. */
let dbInstancePromise = null;

function listZipsDbPaths() {
  const paths = [];
  const explicit = (config.zipsLookupDbPath || '').trim();
  if (explicit) paths.push(explicit);
  paths.push(path.join(repoRoot, 'zips_lookup.db'));
  paths.push(path.join(workerRoot, 'zips_lookup.db'));
  return [...new Set(paths)];
}

async function getZipDatabase() {
  if (!dbInstancePromise) {
    dbInstancePromise = (async () => {
      const candidates = listZipsDbPaths();
      debugLog('ZIP:DB', 'Candidate paths:', candidates.join(' | '));
      const existing = candidates.find((p) => fs.existsSync(p));
      if (!existing) {
        debugLog('ZIP:DB', 'No existing file among candidates.');
        return null;
      }
      debugLog('ZIP:DB', 'Opening SQLite file:', existing);
      const wasmPath = path.join(path.dirname(require.resolve('sql.js/dist/sql-wasm.js')), 'sql-wasm.wasm');
      const wasmBinary = fs.readFileSync(wasmPath);
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs({ wasmBinary });
      const filebuffer = fs.readFileSync(existing);
      const db = new SQL.Database(filebuffer);
      debugLog('ZIP:DB', 'sql.js Database ready, file bytes=', filebuffer.length);
      return { db, path: existing };
    })().catch((e) => {
      dbInstancePromise = null;
      throw e;
    });
  }
  return dbInstancePromise;
}

/**
 * Oxylabs paste format: user:password@host:port (split on last @).
 */
export function parseProxyLine(line) {
  const trimmed = String(line || '').trim();
  const at = trimmed.lastIndexOf('@');
  if (at === -1) {
    throw new Error('Proxy line must look like user:password@host:port (Oxylabs paste format).');
  }
  const hostPort = trimmed.slice(at + 1);
  const userPass = trimmed.slice(0, at);
  const colon = userPass.indexOf(':');
  if (colon === -1) {
    throw new Error("Missing ':' between username and password before @.");
  }
  const username = userPass.slice(0, colon);
  const password = userPass.slice(colon + 1);
  const hp = hostPort.match(/^([^:]+):(\d+)$/);
  if (!hp) {
    throw new Error(`Invalid host:port after @: ${hostPort}`);
  }
  return {
    username,
    password,
    server: `http://${hp[1]}:${hp[2]}`,
  };
}

function applyCredentialsAndSession(templateLine, { username, password, rotateSession }) {
  let line = templateLine;
  line = line.replaceAll('USERNAME', username);
  line = line.replaceAll('PASSWORD', password);
  if (rotateSession && /sessid-replaceMe/i.test(line)) {
    const sid = crypto.randomBytes(8).toString('hex');
    line = line.replace(/sessid-replaceMe/gi, `sessid-${sid}`);
  }
  return line;
}

function parsePhoneCodes(phoneCodeCsv) {
  return String(phoneCodeCsv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function queryZipRow(db, zip) {
  const stmt = db.prepare('SELECT url, phoneCode FROM zips WHERE zip = ?');
  stmt.bind([zip]);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

/**
 * @returns {Promise<{ proxy: { server: string, username: string, password: string } | null, warnings: string[], source: string }>}
 */
export async function resolvePlaywrightProxyForRecord(record) {
  const warnings = [];
  debugLog('ZIP:PROXY', '── resolve proxy for record id=', record?.id, 'zipCode=', record?.zipCode, 'messageSnippet=', String(record?.message || '').slice(0, 80));

  const zipRaw = extractZipCode(record);
  const zip = zipForDbLookup(zipRaw);
  debugLog('ZIP:PROXY', 'extractZipCode raw → zip5:', zipRaw, '→', zip || '(none)');
  if (!zip) {
    warnings.push('No usable 5-digit ZIP on record; cannot pick geo proxy from zips_lookup.db.');
    debugLog('ZIP:PROXY', 'STOP: no_zip → fallback chain');
    return applyFallbackProxy(warnings, 'no_zip');
  }

  const user = (config.oxylabsUsername || '').trim();
  const pass = (config.oxylabsPassword || '').trim();
  const rotate = config.oxylabsRotateSession;
  debugLog('ZIP:PROXY', 'Oxylabs user configured=', Boolean(user), 'password configured=', Boolean(pass), 'rotateSession=', rotate);

  if (!user || !pass) {
    warnings.push('OXYLABS_USERNAME (or OXYLABS_SUBUSER / userName) and OXYLABS_PASSWORD (or password) not set; skipping DB template substitution.');
    debugLog('ZIP:PROXY', 'STOP: no_creds → fallback chain');
    return applyFallbackProxy(warnings, 'no_creds');
  }

  let db;
  let dbPathUsed = '';
  try {
    const opened = await getZipDatabase();
    if (!opened) {
      warnings.push(`zips_lookup.db not found. Tried: ${listZipsDbPaths().join(' | ')}`);
      debugLog('ZIP:PROXY', 'STOP: no_db → fallback chain');
      return applyFallbackProxy(warnings, 'no_db');
    }
    db = opened.db;
    dbPathUsed = opened.path;
    debugLog('ZIP:PROXY', 'Using DB file:', dbPathUsed);
  } catch (e) {
    warnings.push(`Could not open zips_lookup.db (sql.js): ${e instanceof Error ? e.message : String(e)}`);
    debugLog('ZIP:PROXY', 'STOP: db_open_error', e);
    return applyFallbackProxy(warnings, 'db_open_error');
  }

  let row;
  try {
    row = queryZipRow(db, zip);
    debugLog('ZIP:PROXY', 'SQL row for zip=', zip, row ? 'FOUND (url len=' + String(row.url || '').length + ')' : 'NOT FOUND');
  } catch (e) {
    warnings.push(`SQLite query failed: ${e instanceof Error ? e.message : String(e)}`);
    debugLog('ZIP:PROXY', 'STOP: db_error', e);
    return applyFallbackProxy(warnings, 'db_error');
  }

  if (!row?.url) {
    warnings.push(`ZIP ${zip} not found in zips_lookup.db (${dbPathUsed}).`);
    debugLog('ZIP:PROXY', 'STOP: zip_missing → fallback chain');
    return applyFallbackProxy(warnings, 'zip_missing');
  }

  const npa = extractUsAreaCode(record?.phone);
  const allowed = parsePhoneCodes(row.phoneCode);
  debugLog('ZIP:PROXY', 'Phone area code=', npa || '(none)', 'allowed count=', allowed.length, 'match=', !npa || allowed.length === 0 || allowed.includes(npa));
  if (npa && allowed.length > 0 && !allowed.includes(npa)) {
    warnings.push(
      `Lead phone area code ${npa} is not in zips_lookup phoneCode list for ZIP ${zip} (${row.phoneCode}). Using ZIP-based proxy anyway.`,
    );
  }

  let composed;
  try {
    composed = applyCredentialsAndSession(String(row.url).trim(), {
      username: user,
      password: pass,
      rotateSession: rotate,
    });
    debugLog('ZIP:PROXY', 'Template substituted, composed line length=', composed.length);
  } catch (e) {
    warnings.push(`Template substitution failed: ${e instanceof Error ? e.message : String(e)}`);
    debugLog('ZIP:PROXY', 'STOP: template_error', e);
    return applyFallbackProxy(warnings, 'template_error');
  }

  try {
    const parsed = parseProxyLine(composed);
    debugLog(
      'ZIP:PROXY',
      'OK Playwright proxy server=',
      parsed.server,
      'usernamePreview=',
      debugPreviewProxyUser(parsed.username),
      '(password hidden)',
    );
    if (warnings.length) debugLog('ZIP:PROXY', 'warnings:', warnings);
    return {
      proxy: { server: parsed.server, username: parsed.username, password: parsed.password },
      warnings,
      source: `zips_lookup:${zip}`,
    };
  } catch (e) {
    warnings.push(`Invalid composed proxy line: ${e instanceof Error ? e.message : String(e)}`);
    debugLog('ZIP:PROXY', 'STOP: parse_error', e);
    return applyFallbackProxy(warnings, 'parse_error');
  }
}

function applyFallbackProxy(warnings, reason) {
  const raw = (config.oxylabsProxyFallback || '').trim();
  debugLog('ZIP:FALLBACK', 'reason=', reason, 'OXYLABS_PROXY set=', Boolean(raw));
  if (!raw) {
    debugLog('ZIP:FALLBACK', '→ no proxy (direct connection)');
    return { proxy: null, warnings, source: `none:${reason}` };
  }
  try {
    const parsed = parseProxyLine(raw);
    warnings.push('Using OXYLABS_PROXY fallback (full line from env).');
    debugLog('ZIP:FALLBACK', '→ using OXYLABS_PROXY server=', parsed.server, 'userPreview=', debugPreviewProxyUser(parsed.username));
    return {
      proxy: { server: parsed.server, username: parsed.username, password: parsed.password },
      warnings,
      source: `fallback:${reason}`,
    };
  } catch (e) {
    warnings.push(`OXYLABS_PROXY fallback invalid: ${e instanceof Error ? e.message : String(e)}`);
    debugLog('ZIP:FALLBACK', 'parse OXYLABS_PROXY failed', e);
    return { proxy: null, warnings, source: `none:${reason}` };
  }
}
