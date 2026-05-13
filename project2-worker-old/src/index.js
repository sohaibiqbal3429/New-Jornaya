import { config } from './config.js';
import { runWorkerService } from './queue-runner.js';
import { logEvent } from './logger.js';
import { debugLog, isVerboseConsole } from './debug-console.js';

async function main() {
  const wslRewrite =
    config.project1BaseUrl !== config.project1BaseUrlRaw ||
    config.targetFormUrl !== config.targetFormUrlRaw;

  debugLog('BOOT', '══════════════════════════════════════════════════════════════');
  debugLog('BOOT', 'project2-worker starting');
  debugLog('BOOT', 'Verbose console:', isVerboseConsole() ? 'ON (set WORKER_VERBOSE_LOG=false to reduce noise)' : 'OFF');
  debugLog('BOOT', 'PROJECT1_BASE_URL (raw → resolved):', config.project1BaseUrlRaw, '→', config.project1BaseUrl);
  debugLog('BOOT', 'TARGET_FORM_URL (raw → resolved):', config.targetFormUrlRaw, '→', config.targetFormUrl);
  debugLog('BOOT', 'TARGET_FORM_HASH:', config.targetFormHash || '(none)');
  debugLog('BOOT', 'WSL localhost rewrite applied:', wslRewrite);
  debugLog('BOOT', 'Oxylabs creds configured:', Boolean(config.oxylabsUsername && config.oxylabsPassword), '(user length:', (config.oxylabsUsername || '').length, ', password set:', Boolean((config.oxylabsPassword || '').length), ')');
  debugLog('BOOT', 'BATCH_SIZE / WORKER_COUNT / EMPTY_QUEUE_SLEEP_MINUTES:', config.batchSize, config.workerCount, config.emptyQueueSleepMinutes);
  debugLog('BOOT', 'FORM_WAIT_MS / NAVIGATION_TIMEOUT_MS / LEADID_WAIT_MS:', config.formWaitMs, config.navigationTimeoutMs, config.leadIdWaitMs);
  debugLog('BOOT', 'Playwright: headless=', config.playwrightHeadless, 'ignoreHTTPSErrors=', config.playwrightIgnoreHttpErrors);
  debugLog('BOOT', 'Chromium extra args count:', config.playwrightChromiumArgs?.length ?? 0);
  debugLog('BOOT', '══════════════════════════════════════════════════════════════');

  logEvent({
    type: 'service_start',
    message: 'Project2 worker service started.',
    config: {
      project1BaseUrl: config.project1BaseUrl,
      project1BaseUrlRaw: config.project1BaseUrlRaw,
      targetFormUrl: config.targetFormUrl,
      targetFormUrlRaw: config.targetFormUrlRaw,
      wslLocalhostRewriteApplied: wslRewrite,
      oxylabsConfigured: Boolean(config.oxylabsUsername && config.oxylabsPassword),
      batchSize: config.batchSize,
      workerCount: config.workerCount,
      emptyQueueSleepMinutes: config.emptyQueueSleepMinutes,
      leadIdWaitMs: config.leadIdWaitMs,
      playwrightHeadless: config.playwrightHeadless,
    },
  });

  await runWorkerService();
}

main().catch((error) => {
  console.error('[FATAL]', error);
  debugLog('BOOT', 'FATAL', error);
  logEvent({
    type: 'service_fatal',
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
