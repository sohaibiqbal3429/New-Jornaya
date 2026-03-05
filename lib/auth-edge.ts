import { jwtVerify } from './jwt-edge';

export const SESSION_COOKIE = 'chs_admin_session';

export async function verifySessionTokenEdge(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const payload = await jwtVerify(token, secret);
  if (!payload) return null;
  if (payload.role !== 'admin' || !payload.email) return null;
  return payload;
}
