import { MongoClient, MongoClientOptions, Db } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://danushkaviti:danush12345@cluster0.uw1ad1q.mongodb.net/ip-sakti?retryWrites=true&w=majority";

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

export async function connectToMongo(): Promise<MongoClient> {
  if (globalWithMongo._mongoClientPromise) {
    try {
      const client = await globalWithMongo._mongoClientPromise;
      // Quick ping to check topology health
      await client.db("admin").command({ ping: 1 });
      return client;
    } catch {
      // Invalidate dead or closed topology
      globalWithMongo._mongoClientPromise = undefined;
      globalWithMongo._mongoClient = undefined;
    }
  }

  const client = new MongoClient(uri, options);
  globalWithMongo._mongoClient = client;
  globalWithMongo._mongoClientPromise = client.connect();

  try {
    const connectedClient = await globalWithMongo._mongoClientPromise;
    return connectedClient;
  } catch (err) {
    globalWithMongo._mongoClientPromise = undefined;
    globalWithMongo._mongoClient = undefined;
    throw err;
  }
}

// Proxied Promise for full backward-compatibility with `await clientPromise`
const clientPromise: Promise<MongoClient> = {
  then(onfulfilled, onrejected) {
    return connectToMongo().then(onfulfilled, onrejected);
  },
  catch(onrejected) {
    return connectToMongo().catch(onrejected);
  },
  finally(onfinally) {
    return connectToMongo().finally(onfinally);
  },
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

export async function getDatabase(dbName = "ip-sakti"): Promise<Db> {
  const client = await connectToMongo();
  return client.db(dbName);
}

export default clientPromise;