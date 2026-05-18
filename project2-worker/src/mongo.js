import { MongoClient, ObjectId } from 'mongodb';
import { config } from './config.js';

let clientPromise;

function normalizeLeadiDToken(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidLeadiDToken(value) {
  return /^[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-F0-9]{12}$/i.test(normalizeLeadiDToken(value));
}

export async function getMongoClient() {
  if (!clientPromise) {
    clientPromise = new MongoClient(config.mongoUri).connect();
  }
  return clientPromise;
}

async function submissionsCollection() {
  const client = await getMongoClient();
  return client.db(config.mongoDb).collection('submissions');
}

/**
 * Atomically lease the next submission that still needs bot verification.
 * Mongo field is `isVarified` (typo): **not true** means pending — same as “unverified” in plain language.
 * @returns {Promise<import('mongodb').WithId<Record<string, unknown>> | null>}
 */
export async function claimNextSubmission() {
  const coll = await submissionsCollection();
  const leaseUntil = new Date(Date.now() + config.workerLeaseMs);
  const now = new Date();
  const res = await coll.findOneAndUpdate(
    {
      isVarified: { $ne: true },
      $or: [{ workerLeaseUntil: { $exists: false } }, { workerLeaseUntil: { $lte: now } }],
    },
    { $set: { workerLeaseUntil: leaseUntil } },
    { sort: { createdAt: 1 }, returnDocument: 'after' },
  );
  return res ?? null;
}

export async function releaseLease(id) {
  const coll = await submissionsCollection();
  await coll.updateOne({ _id: new ObjectId(String(id)) }, { $unset: { workerLeaseUntil: '' } });
}

export async function markSubmissionComplete(originalId, { leadiD_token, ip, workerId }) {
  const coll = await submissionsCollection();
  const _id = new ObjectId(String(originalId));
  const existing = await coll.findOne({ _id });
  if (!existing) {
    return;
  }

  const existingPrimaryToken = normalizeLeadiDToken(existing.leadiD_token);
  const existingOriginalToken = normalizeLeadiDToken(existing.original_leadiD_token);
  const verificationToken = normalizeLeadiDToken(leadiD_token);
  const nextIp = typeof ip === 'string' ? ip.trim() : '';
  const setPayload = {
    isVarified: true,
  };

  if (!existingOriginalToken && isValidLeadiDToken(existingPrimaryToken)) {
    setPayload.original_leadiD_token = existingPrimaryToken;
  }

  if (isValidLeadiDToken(verificationToken)) {
    setPayload.verification_leadiD_token = verificationToken;
  }

  if (nextIp) {
    setPayload.ip = nextIp;
  }

  setPayload.verificationMeta = {
    verifiedAt: new Date().toISOString(),
    workerId: workerId || 'unknown-worker',
  };
  if (nextIp) {
    setPayload.verificationMeta.ip = nextIp;
  }

  await coll.updateOne(
    { _id },
    {
      $set: setPayload,
      $unset: { workerLeaseUntil: '' },
    },
  );
}

export async function deleteSubmissionById(id, extraFilter = {}) {
  if (!ObjectId.isValid(String(id))) return false;
  const coll = await submissionsCollection();
  const r = await coll.deleteOne({ _id: new ObjectId(String(id)), ...extraFilter });
  return r.deletedCount === 1;
}
