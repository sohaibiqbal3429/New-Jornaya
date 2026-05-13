import fs from 'fs';
import initSqlJs from 'sql.js';
import { config } from './config.js';

let dbInst;

export async function getZipDb() {
  if (!dbInst) {
    const SQL = await initSqlJs();
    const buf = fs.readFileSync(config.zipsDbPath);
    dbInst = new SQL.Database(buf);
  }
  return dbInst;
}

/**
 * @param {import('sql.js').Database} db
 * @param {string} zip
 * @returns {string | null} raw url template
 */
export function lookupProxyUrlTemplate(db, zip) {
  const z = String(zip || '').trim();
  if (!z) return null;
  const stmt = db.prepare('SELECT url FROM zips WHERE zip = ? LIMIT 1');
  stmt.bind([z]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  const url = row.url;
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}
