function ts() {
  return new Date().toISOString();
}

export function log(event, detail = '') {
  const line = detail ? `[${ts()}] [${event}] ${detail}` : `[${ts()}] [${event}]`;
  console.log(line);
}

/** Multi-line human-readable block (stdout). */
export function logBlock(title, rows) {
  const w = Math.max(24, title.length + 8);
  const bar = '═'.repeat(w);
  console.log(`\n${bar}\n  ${title}\n${bar}`);
  for (const row of rows) {
    console.log(`  ${row}`);
  }
  console.log(`${bar}\n`);
}
