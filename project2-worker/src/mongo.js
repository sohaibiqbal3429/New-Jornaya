import { MongoClient, ObjectId } from 'mongodb';
import { config } from './config.js';

let clientPromise;

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

export async function markSubmissionComplete(originalId, { leadiD_token, ip }) {
  const coll = await submissionsCollection();
  await coll.updateOne(
    { _id: new ObjectId(String(originalId)) },
    {
      $set: {
        isVarified: true,
        leadiD_token,
        ip,
      },
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
