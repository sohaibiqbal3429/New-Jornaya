import os from 'node:os';
import { config } from './config.js';
import { fetchPendingSubmissions, markVerified } from './project1-client.js';
import { submitRecordViaPlaywright } from './form-worker.js';
import { logEvent } from './logger.js';
import { debugLog } from './debug-console.js';

function getSystemIp() {
  const interfaces = os.networkInterfaces();
  for (const values of Object.values(interfaces)) {
    for (const value of values || []) {
      if (value.family === 'IPv4' && !value.internal) {
        return value.address;
      }
    }
  }
  return 'unknown';
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getSourceRecordSnapshot = (record) => ({
  id: record.id,
  fullName: record.fullName || '',
  email: record.email || '',
  phone: record.phone || '',
  zipCode: record.zipCode || '',
  message: record.message || '',
  leadiD_token: record.leadiD_token || '',
});

export async function runWorkerService() {
  const queue = [];
  const inFlightIds = new Set();
  const botIp = getSystemIp();

  async function refillQueueIfNeeded() {
    if (queue.length > 0) return;

    const pending = await fetchPendingSubmissions(config.batchSize);
    let skippedInFlight = 0;
    for (const item of pending) {
      if (!inFlightIds.has(item.id)) {
        queue.push(item);
      } else {
        skippedInFlight += 1;
      }
    }

    debugLog(
      'QUEUE',
      'refill: apiCount=',
      pending.length,
      'enqueued=',
      queue.length,
      'skippedAlreadyInFlight=',
      skippedInFlight,
      'inFlightIds=',
      [...inFlightIds].join(',') || '(none)',
    );
    logEvent({
      type: 'queue_refill',
      fetchedCount: pending.length,
      queueDepth: queue.length,
    });
  }

  async function workerLoop(workerId) {
    debugLog('WORKER', workerId, 'loop started');
    while (true) {
      if (queue.length === 0) {
        await sleep(config.loopDelayMs);
        continue;
      }

      const record = queue.shift();
      if (!record || inFlightIds.has(record.id)) {
        if (record && inFlightIds.has(record.id)) {
          debugLog('WORKER', workerId, 'WARN: shifted record already in-flight (duplicate queue id?), dropping id=', record.id);
        }
        continue;
      }

      inFlightIds.add(record.id);
      const fetchedAt = new Date().toISOString();
      debugLog('WORKER', workerId, 'record_started id=', record.id, 'queueRemaining=', queue.length);
      logEvent({
        type: 'record_started',
        workerId,
        fetchedAt,
        sourceRecord: getSourceRecordSnapshot(record),
        queueDepthAfterPick: queue.length,
        note: 'Playwright + proxy can take 1–3+ minutes before record_processed.',
      });

      try {
        logEvent({
          type: 'record_playwright_running',
          workerId,
          recordId: record.id,
          targetFormUrl: config.targetFormUrl,
        });
        const result = await submitRecordViaPlaywright(record);
        debugLog('WORKER', workerId, 'playwright done; calling markVerified id=', record.id);
        await markVerified({
          id: record.id,
          workerId,
          ip: botIp,
          submittedLeadiDToken: result.submittedLeadiDToken,
        });

        if (Array.isArray(result.warnings) && result.warnings.length > 0) {
          logEvent({
            type: 'record_warning',
            workerId,
            fetchedAt,
            sourceRecord: getSourceRecordSnapshot(record),
            warnings: result.warnings,
          });
        }

        logEvent({
          type: 'record_processed',
          status: 'success',
          workerId,
          fetchedAt,
          botIp,
          sourceRecord: getSourceRecordSnapshot(record),
          submittedRecord: {
            ...(result.submittedData || {}),
            submittedLeadiDToken: result.submittedLeadiDToken || '',
          },
          submitNetwork: result.submitNetwork || null,
        });
        debugLog('WORKER', workerId, 'SUCCESS id=', record.id, 'LeadiD len=', (result.submittedLeadiDToken || '').length);
      } catch (error) {
        debugLog('WORKER', workerId, 'FAILED id=', record.id, error instanceof Error ? error.message : String(error));
        logEvent({
          type: 'record_processed',
          status: 'failed',
          workerId,
          fetchedAt,
          botIp,
          sourceRecord: getSourceRecordSnapshot(record),
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        inFlightIds.delete(record.id);
        debugLog('WORKER', workerId, 'inFlight cleared id=', record.id, 'inFlightSize=', inFlightIds.size);
      }
    }
  }

  async function coordinatorLoop() {
    while (true) {
      try {
        await refillQueueIfNeeded();
        if (queue.length === 0) {
          if (inFlightIds.size > 0) {
            // Workers hold jobs; stay quiet here (WORKER/FORM logs show progress).
            await sleep(config.loopDelayMs);
            continue;
          }
          const waitMs = config.emptyQueueSleepMinutes * 60 * 1000;
          debugLog('QUEUE', 'no pending work → sleep', waitMs, 'ms');
          logEvent({
            type: 'queue_empty_wait',
            waitMs,
            message: 'No pending records. Waiting before next fetch.',
          });
          await sleep(waitMs);
          continue;
        }

        debugLog('QUEUE', 'coordinator tick: queueDepth=', queue.length, 'sleeping', config.loopDelayMs, 'ms');
        // Prevent a tight loop when queue is non-empty; give workers time slices.
        await sleep(config.loopDelayMs);
      } catch (error) {
        debugLog('QUEUE', 'coordinator error', error instanceof Error ? error.message : String(error));
        logEvent({
          type: 'queue_error',
          error: error instanceof Error ? error.message : String(error),
        });
        await sleep(5000);
      }
    }
  }

  const workers = Array.from({ length: config.workerCount }, (_, index) => workerLoop(`worker-${index + 1}`));
  await Promise.all([coordinatorLoop(), ...workers]);
}
