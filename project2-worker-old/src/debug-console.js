/**
 * Verbose console tracing for the worker (toggle: WORKER_VERBOSE_LOG=false).
 */
export function isVerboseConsole() {
  return `${process.env.WORKER_VERBOSE_LOG ?? 'true'}`.toLowerCase() !== 'false';
}

export function debugLog(scope, ...args) {
  if (!isVerboseConsole()) return;
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${scope}]`, ...args);
}

export function debugPreviewProxyUser(username) {
  if (!username) return '(empty)';
  if (username.length <= 72) return username;
  return `${username.slice(0, 72)}…`;
}
