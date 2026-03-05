const te = new TextEncoder();

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function jwtVerify(token: string, secret: string) {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;

  const key = await crypto.subtle.importKey('raw', te.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('HMAC', key, fromBase64Url(signature), te.encode(`${header}.${payload}`));
  if (!ok) return null;

  const json = new TextDecoder().decode(fromBase64Url(payload));
  const data = JSON.parse(json) as { exp?: number; [k: string]: unknown };
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
  return data as { exp: number; role?: string; email?: string };
}
