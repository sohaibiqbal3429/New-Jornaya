import fs from 'node:fs';

/** WSL2 / WSL1 Linux userland (not Docker on Linux). */
export function isWsl() {
  if (process.platform !== 'linux') return false;
  try {
    const v = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    return v.includes('microsoft') || v.includes('wsl');
  } catch {
    return false;
  }
}

/**
 * On WSL2, Windows host is usually the first "nameserver" in /etc/resolv.conf.
 * Use this so http://localhost:3000 (WSL) can reach Next on Windows.
 */
export function windowsHostIpFromWsl() {
  try {
    const text = fs.readFileSync('/etc/resolv.conf', 'utf8');
    const m = text.match(/^nameserver\s+(\d{1,3}(?:\.\d{1,3}){3})/m);
    return m?.[1]?.trim() || '';
  } catch {
    return '';
  }
}

/**
 * Replace localhost / 127.0.0.1 with Windows host IP when running under WSL
 * and WSL_LOCALHOST_REWRITE is not "false".
 */
export function rewriteLocalhostForWsl(urlString) {
  const raw = String(urlString || '').trim();
  if (!raw) return raw;
  if (`${process.env.WSL_LOCALHOST_REWRITE || 'true'}`.toLowerCase() === 'false') return raw;
  if (!isWsl()) return raw;
  const host = windowsHostIpFromWsl();
  if (!host) return raw;
  try {
    const u = new URL(raw);
    if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') return raw;
    u.hostname = host;
    return u.href;
  } catch {
    return raw;
  }
}

/** Extra Chromium flags for WSL/Docker/CI where the default sandbox can crash the browser. */
export function defaultChromiumArgsForRuntime() {
  const isLinux = process.platform === 'linux';
  if (isWsl() || process.env.CI === 'true' || isLinux) {
    return ['--disable-dev-shm-usage', '--no-sandbox', '--disable-gpu'];
  }
  return ['--disable-dev-shm-usage'];
}
