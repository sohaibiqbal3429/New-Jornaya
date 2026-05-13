import { ObjectId, WithId } from 'mongodb';
import { getMongoClient } from './dbConnect';

export type SubmissionStatus = 'new' | 'seen' | 'archived';

export type Submission = {
  id: string;
  formType: string;
  fullName: string;
  email: string;
  phone?: string;
  zipCode?: string;
  company?: string;
  serviceInterest?: string;
  message?: string;
  consent_checked: boolean;
  consent_timestamp: string;
  consent_text_version: string;
  leadiD_token?: string;
  page_url: string;
  page_source: string;
  lead_id?: string;
  journey_identifier?: string;
  isVarified?: boolean;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  status: SubmissionStatus;
};

type SubmissionStored = Omit<Submission, 'id' | 'createdAt'> & {
  createdAt: Date;
};

type SubmissionDocument = WithId<SubmissionStored>;

type CreateSubmissionInput = Omit<Submission, 'id' | 'createdAt' | 'status' | 'isVarified'> & {
  leadiD_token: string;
};

function toSubmission(doc: SubmissionDocument): Submission {
  return {
    id: doc._id.toString(),
    formType: doc.formType,
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    zipCode: doc.zipCode,
    company: doc.company,
    serviceInterest: doc.serviceInterest,
    message: doc.message,
    consent_checked: doc.consent_checked,
    consent_timestamp: doc.consent_timestamp,
    consent_text_version: doc.consent_text_version,
    leadiD_token: doc.leadiD_token,
    page_url: doc.page_url,
    page_source: doc.page_source,
    lead_id: doc.lead_id,
    journey_identifier: doc.journey_identifier,
    isVarified: doc.isVarified ?? false,
    ip: doc.ip,
    userAgent: doc.userAgent,
    createdAt: doc.createdAt.toISOString(),
    status: doc.status,
  };
}

async function getCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB || 'chatters-health');
  return db.collection<SubmissionStored>('submissions');
}

export async function createSubmission(input: CreateSubmissionInput) {
  const collection = await getCollection();
  const duplicateFilter = input.leadiD_token
    ? { leadiD_token: input.leadiD_token }
    : {
        fullName: input.fullName,
        phone: input.phone,
        message: input.message,
      };
  const existing = await collection.findOne(duplicateFilter);
  const doc: SubmissionStored = {
    ...input,
    isVarified: Boolean(existing),
    createdAt: new Date(),
    status: 'new',
  };

  const result = await collection.insertOne(doc);
  return toSubmission({ _id: result.insertedId, ...doc });
}

export async function listSubmissions(params: {
  query?: string;
  formType?: string;
  status?: string;
  consentChecked?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const collection = await getCollection();
  const filter: Record<string, unknown> = {};

  if (params.query) {
    const queryRegex = new RegExp(params.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ fullName: queryRegex }, { email: queryRegex }, { company: queryRegex }];
  }

  if (params.formType && params.formType !== 'all') filter.formType = params.formType;
  if (params.status && params.status !== 'all') filter.status = params.status;
  if (params.consentChecked === 'true') filter.consent_checked = true;
  if (params.consentChecked === 'false') filter.consent_checked = false;

  if (params.from || params.to) {
    const createdAt: Record<string, Date> = {};
    if (params.from) createdAt.$gte = new Date(`${params.from}T00:00:00.000Z`);
    if (params.to) createdAt.$lte = new Date(`${params.to}T23:59:59.999Z`);
    filter.createdAt = createdAt;
  }

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, Math.min(100, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    data: docs.map((doc) => toSubmission(doc)),
    total,
    page,
    limit,
  };
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getCollection();
  const _id = new ObjectId(id);
  const result = await collection.findOneAndUpdate(
    { _id },
    { $set: { status } },
    { returnDocument: 'after' },
  );

  if (!result) return null;
  return toSubmission(result);
}

export async function deleteSubmission(id: string) {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function listPendingVerificationSubmissions(limit: number) {
  const collection = await getCollection();
  const safeLimit = Math.max(1, Math.min(500, limit));
  const docs = await collection
    .find({ isVarified: { $ne: true } })
    .sort({ createdAt: 1 })
    .limit(safeLimit)
    .toArray();

  return docs.map((doc) => toSubmission(doc));
}

export async function markSubmissionVerified(params: {
  id: string;
  submittedLeadiDToken?: string;
  verificationMeta?: {
    verifiedAt: string;
    workerId: string;
    ip?: string;
  };
}) {
  if (!ObjectId.isValid(params.id)) return null;

  const collection = await getCollection();
  const _id = new ObjectId(params.id);

  const setPayload: Record<string, unknown> = {
    isVarified: true,
  };

  // Always persist the token captured by bot, whether old token existed or not.
  if (params.submittedLeadiDToken !== undefined) {
    setPayload.leadiD_token = params.submittedLeadiDToken;
  }
  if (params.verificationMeta) {
    setPayload.verificationMeta = params.verificationMeta;
  }

  const result = await collection.findOneAndUpdate(
    { _id },
    {
      $set: setPayload,
    },
    { returnDocument: 'after' },
  );

  if (!result) return null;
  return toSubmission(result);
}
