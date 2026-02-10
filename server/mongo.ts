import { Db, MongoClient } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI must be set");
  }

  const dbName = process.env.MONGODB_DB;

  client = new MongoClient(uri);
  await client.connect();
  db = dbName ? client.db(dbName) : client.db();

  await Promise.all([
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("newsletterSubscribers").createIndex({ email: 1 }, { unique: true }),
    db.collection("kenyaCounties").createIndex({ name: 1 }, { unique: true }),
  ]);

  return db;
}

export function getMongoDb(): Db {
  if (!db) {
    throw new Error("MongoDB not connected. Call connectMongo() first.");
  }
  return db;
}

export async function getNextId(sequenceName: string): Promise<number> {
  const database = getMongoDb();
  const res = await database.collection<{ _id: string; seq: number }>("counters").findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  if (!res) {
    throw new Error(`Failed to generate id for ${sequenceName}`);
  }

  return res.seq;
}
