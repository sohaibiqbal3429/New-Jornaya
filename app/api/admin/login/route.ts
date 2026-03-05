import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken, verifyAdminCredentials } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const body = await req.json().catch(() => null);
  const email = body?.email ?? '';
  const password = body?.password ?? '';

  const limit = checkRateLimit(`${ip}:${String(email).toLowerCase()}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
  }

  try {
    const valid = verifyAdminCredentials(email, password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = createSessionToken(email);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Authentication unavailable.' }, { status: 500 });
  }
}
