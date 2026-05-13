import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../zips_lookup.db');
const SQL = await initSqlJs();
const db = new SQL.Database(fs.readFileSync(dbPath));
const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
console.log(
  'tables',
  tables[0]?.values?.map((r) => r[0]),
);
const rows = db.exec(`SELECT zip, url FROM zips WHERE zip = '54990' LIMIT 1`);
console.log(JSON.stringify(rows, null, 2));
