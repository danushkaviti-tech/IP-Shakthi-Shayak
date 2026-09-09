const Redis = require("ioredis");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  console.log("=========================================");
  console.log("    IP-SAKTI CACHE PURGE / CLEAR TOOL    ");
  console.log("=========================================");

  // 1. Redis Cache Purge
  const redisUrls = [
    process.env.REDIS_URL,
    process.env.KV_URL,
    process.env.UPSTASH_REDIS_REST_URL,
  ].filter(Boolean);

  if (redisUrls.length === 0) {
    console.log("ℹ️ No remote REDIS_URL configured in local environment.");
  }

  for (const url of redisUrls) {
    if (url.startsWith("http")) continue;
    try {
      console.log("Connecting to Redis...");
      const redis = new Redis(url, {
        maxRetriesPerRequest: 1,
        connectTimeout: 4000,
        enableOfflineQueue: false,
        lazyConnect: true,
      });
      await redis.connect();
      const keys = await redis.keys("ipsakti:*");
      console.log(`Found ${keys.length} ipsakti:* keys in Redis.`);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`✅ Deleted ${keys.length} keys from Redis.`);
      }
      await redis.flushdb();
      console.log("✅ Redis FLUSHDB completed successfully.");
      await redis.quit();
    } catch (e) {
      console.warn("⚠️ Redis warning:", e.message);
    }
  }

  // 2. MongoDB Shared RAG Cache Purge
  const mongoUri =
    process.env.MONGODB_URI ||
    "mongodb+srv://danushkaviti:danush12345@cluster0.uw1ad1q.mongodb.net/ip-sakti?retryWrites=true&w=majority";

  if (mongoUri) {
    try {
      console.log("Connecting to MongoDB Atlas...");
      const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      console.log("✅ Connected to MongoDB.");

      for (const dbName of ["ip-sakti", "ipsakti"]) {
        const db = client.db(dbName);
        try {
          const count = await db.collection("rag_cache").countDocuments();
          console.log(`Database '${dbName}' -> collection 'rag_cache' document count: ${count}`);
          if (count > 0) {
            const delRes = await db.collection("rag_cache").deleteMany({});
            console.log(`✅ Cleared ${delRes.deletedCount} documents from '${dbName}.rag_cache'.`);
          } else {
            console.log(`ℹ️ '${dbName}.rag_cache' is already empty.`);
          }
        } catch (colErr) {
          console.log(`Note for collection ${dbName}.rag_cache:`, colErr.message);
        }
      }
      await client.close();
      console.log("✅ MongoDB connection closed.");
    } catch (err) {
      console.warn("⚠️ MongoDB error:", err.message);
    }
  }

  console.log("=========================================");
  console.log("    ALL CACHES SUCCESSFULLY CLEARED!     ");
  console.log("=========================================");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error clearing cache:", err);
    process.exit(1);
  });
