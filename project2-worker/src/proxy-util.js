import crypto from 'crypto';
import dns from 'dns/promises';

/**
 * @param {string} template url from SQLite (may omit scheme)
 * @param {{ userName: string, password: string }} creds
 */
export function buildProxyServerString(template, creds) {
  const sess = crypto.randomBytes(6).toString('hex');
  let s = template
    .replaceAll('USERNAME', creds.userName)
    .replaceAll('PASSWORD', creds.password)
    .replaceAll('replaceMe', sess);
  if (!s.includes('://')) {
    s = `http://${s}`;
  }
  return s;
}

/**
 * Parse `http://user:pass@host:port` where user may contain colons (Oxylabs).
 * @param {string} fullWithScheme
 * @returns {{ server: string, username: string, password: string }}
 */
export function parseProxyForPlaywright(fullWithScheme) {
  const at = fullWithScheme.lastIndexOf('@');
  if (at === -1) {
    throw new Error('Proxy URL missing @ host separator');
  }
  const schemeEnd = fullWithScheme.indexOf('//');
  const start = schemeEnd === -1 ? 0 : schemeEnd + 2;
  const userinfo = fullWithScheme.slice(start, at);
  const hostport = fullWithScheme.slice(at + 1);
  const colon = userinfo.lastIndexOf(':');
  if (colon === -1) {
    throw new Error('Proxy URL missing password colon');
  }
  const username = userinfo.slice(0, colon);
  const password = userinfo.slice(colon + 1);
  const isHttps = fullWithScheme.toLowerCase().startsWith('https');
  const server = `${isHttps ? 'https' : 'http'}://${hostport}`;
  return { server, username, password };
}

/** Mask password in `http://user:secret@host:port` for logs. */
export function redactProxyConnectionString(fullWithScheme) {
  const at = fullWithScheme.lastIndexOf('@');
  if (at === -1) return fullWithScheme;
  const schemeEnd = fullWithScheme.indexOf('//');
  const start = schemeEnd === -1 ? 0 : schemeEnd + 2;
  const userinfo = fullWithScheme.slice(start, at);
  const hostport = fullWithScheme.slice(at + 1);
  const colon = userinfo.lastIndexOf(':');
  if (colon === -1) return fullWithScheme.replace(/:[^:@/]+@/, ':***@');
  const user = userinfo.slice(0, colon);
  const prefix = fullWithScheme.slice(0, start);
  return `${prefix}${user}:***@${hostport}`;
}

/**
 * Resolve proxy hostname (e.g. pr.oxylabs.io) to A/AAAA — often **multiple** addresses (Oxylabs entry points).
 * This is DNS to the **proxy gateway**, not the residential egress IP for the ZIP (that comes from ipify through the tunnel).
 * @param {string} hostname from Playwright `proxy.server`
 */
export async function resolveProxyHostEntries(hostname) {
  const ipv4 = await dns.resolve4(hostname).catch(() => /** @type {string[]} */ ([]));
  const ipv6 = await dns.resolve6(hostname).catch(() => /** @type {string[]} */ ([]));
  return { hostname, ipv4, ipv6 };
}
