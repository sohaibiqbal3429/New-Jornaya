import { config } from './config.js';
import { processSubmission } from './form-worker.js';
import { claimNextSubmission, getMongoClient } from './mongo.js';
import { log, logBlock } from './logger.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** In-memory queue of already-leased jobs (up to BATCH_SIZE). */
const queue = [];

/** Serialize top-up so concurrent workers do not over-claim. */
let topUpChain = Promise.resolve();

async function topUpQueue() {
  topUpChain = topUpChain.then(async () => {
    while (queue.length < config.batchSize) {
      const job = await claimNextSubmission();
      if (!job) break;
      queue.push(job);
    }
  });
  await topUpChain;
}

async function workerLoop(workerId) {
  log('worker_started', `slot=${workerId}`);
  while (true) {
    try {
      await topUpQueue();
      if (queue.length === 0) {
        log('queue_empty', `worker=${workerId} sleep_ms=${config.emptyQueueSleepMs}`);
        await sleep(config.emptyQueueSleepMs);
        continue;
      }
      const job = queue.shift();
      if (!job) {
        await sleep(config.loopDelayMs);
        continue;
      }
      log('job_assigned', `worker=${workerId} queue_remaining≈${queue.length} mongo_id=${job._id?.toString?.() || job._id}`);
      await processSubmission(job, workerId);
      await sleep(config.loopDelayMs);
    } catch (e) {
      log('failed', `worker=${workerId} loop ${e?.stack || e}`);
      await sleep(5000);
    }
  }
}

async function main() {
  await getMongoClient();
  logBlock('Project2 worker — config snapshot', [
    `WORKER_COUNT:        ${config.workerCount}`,
    `BATCH_SIZE:          ${config.batchSize}`,
    `TARGET_FORM_URL:     ${config.targetFormUrl}`,
    `PROJECT1_BASE_URL:   ${config.project1BaseUrl}`,
    `playwright proxy:    ${config.usePlaywrightProxy ? 'ON (Oxylabs in browser)' : 'OFF (direct browser — see SKIP_PROXY_FOR_LOCALHOST)'}`,
    `localhost target:    ${config.localhostTarget}`,
    `LOOP_DELAY_MS:       ${config.loopDelayMs}`,
    `EMPTY_QUEUE_SLEEP:   ${config.emptyQueueSleepMs} ms`,
  ]);
  await Promise.all(Array.from({ length: config.workerCount }, (_, i) => workerLoop(i + 1)));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
