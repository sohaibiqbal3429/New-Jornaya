import fs from 'node:fs';
import path from 'node:path';
import { MongoClient } from 'mongodb';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function extractZipCode(message) {
  const text = String(message || '');
  const labeled = text.match(/zip\s*code\s*[:\-]?\s*"?([0-9]{4,10})"?/i);
  if (labeled?.[1]) return labeled[1];
  const generic = text.match(/\b([0-9]{4,10})\b/);
  return generic?.[1] || '';
}

async function main() {
  const root = path.resolve(process.cwd());
  loadEnvFile(path.join(root, '.env.local'));
  loadEnvFile(path.join(root, '.env'));

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'chatters-health';
  if (!uri) {
    throw new Error('Missing MONGODB_URI in .env.local/.env');
  }

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const collection = client.db(dbName).collection('submissions');
    const cursor = collection.find({
      $or: [{ zipCode: { $exists: false } }, { zipCode: '' }, { zipCode: null }],
      message: { $type: 'string', $ne: '' },
    });

    let scanned = 0;
    let updated = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc) continue;
      scanned += 1;
      const zipCode = extractZipCode(doc.message);
      if (!zipCode) continue;

      const result = await collection.updateOne(
        { _id: doc._id, $or: [{ zipCode: { $exists: false } }, { zipCode: '' }, { zipCode: null }] },
        { $set: { zipCode } },
      );
      if (result.modifiedCount > 0) updated += 1;
    }

    console.log(JSON.stringify({ ok: true, scanned, updated }));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
});
