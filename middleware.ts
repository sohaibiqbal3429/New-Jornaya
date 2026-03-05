import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth-edge';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin') return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
