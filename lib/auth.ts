import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'chs_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function b64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function unb64url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function sign(data: string, secret: string) {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.');
  }

  return safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase()) && safeEqual(password, adminPassword);
}

export function createSessionToken(email: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('Missing AUTH_SECRET environment variable.');

  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = b64url(JSON.stringify({ email, role: 'admin', exp }));
  const unsigned = `${header}.${payload}`;
  const signature = sign(unsigned, secret);
  return `${unsigned}.${signature}`;
}

export function verifySessionToken(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;

  const expected = sign(`${header}.${payload}`, secret);
  if (!safeEqual(signature, expected)) return null;

  try {
    const data = JSON.parse(unb64url(payload)) as { email?: string; role?: string; exp?: number };
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    if (data.role !== 'admin' || !data.email) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
