import { config } from './config.js';

function normalizeZipDigits(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length >= 3 && digits.length <= 10) return digits;
  return '';
}

/** First 5 digits for SQLite `zips.zip` key (ZIP+4 → ZIP). */
export function zipForDbLookup(zipDigits) {
  const d = String(zipDigits || '').replace(/\D/g, '');
  if (d.length >= 5) return d.slice(0, 5);
  return '';
}

export function extractZipCode(record) {
  const directZip = normalizeZipDigits(record?.zipCode);
  if (directZip) return directZip;

  const message = String(record?.message || '');
  const labeledZip = message.match(/zip\s*code\s*[:\-#]?\s*"?([0-9]{3,10})"?/i);
  if (labeledZip?.[1]) {
    const z = normalizeZipDigits(labeledZip[1]);
    if (z) return z;
  }

  const anyZipLike = message.match(/\b[0-9]{3,10}\b/);
  if (anyZipLike?.[0]) return anyZipLike[0];

  return normalizeZipDigits(config.defaultZipCode);
}

/** US NANP area code (NPA) from phone string, or ''. */
export function extractUsAreaCode(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) return d.slice(1, 4);
  if (d.length >= 10) return d.slice(-10, -7);
  if (d.length >= 3) return d.slice(0, 3);
  return '';
}
