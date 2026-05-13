import fs from 'node:fs';
import path from 'node:path';

const logsDir = path.resolve(process.cwd(), 'logs');
const logFile = path.join(logsDir, 'processing.jsonl');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export function logEvent(event) {
  const payload = {
    loggedAt: new Date().toISOString(),
    ...event,
  };

  fs.appendFileSync(logFile, `${JSON.stringify(payload)}\n`, 'utf8');
  console.log(JSON.stringify(payload));
}
