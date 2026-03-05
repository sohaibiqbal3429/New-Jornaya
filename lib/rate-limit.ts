const attempts = new Map<string, { count: number; firstAttemptAt: number }>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || now - current.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (current.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, retryAfterMs: WINDOW_MS - (now - current.firstAttemptAt) };
  }

  current.count += 1;
  attempts.set(key, current);
  return { allowed: true, remaining: MAX_ATTEMPTS - current.count };
}
