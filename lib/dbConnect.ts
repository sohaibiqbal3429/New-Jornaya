import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }
  return uri;
}

export function getMongoClient() {
  const uri = getMongoUri();

  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri);
    global.__mongoClientPromise = client.connect();
  }

  return global.__mongoClientPromise;
}
