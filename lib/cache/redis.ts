import Redis from "ioredis";
import clientPromise from "@/lib/mongodb";

export interface CachedRAGData {
  answer: string;
  sources: any[];
  classification?: any;
  accuracyScore: number;
  similarityIndex: number;
  cachedAt: string;
  hitCount?: number;
}

// Global Redis client singleton
let redisClient: Redis | null = null;
let redisInitialized = false;

// Fallback in-memory LRU Cache map with 1000 items capacity
const memoryCache = new Map<string, { data: CachedRAGData; expiresAt: number }>();
const MAX_MEMORY_CACHE_SIZE = 1000;

function getRedisInstance(): Redis | null {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const redisUrl =
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    process.env.UPSTASH_REDIS_REST_URL;

  if (redisUrl && !redisUrl.startsWith("http")) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      redisClient.on("error", (err) => {
        console.warn("Redis connection warning:", err?.message || err);
      });
    } catch (e) {
      console.warn("Failed to initialize Redis client:", e);
      redisClient = null;
    }
  }

  return redisClient;
}

/**
 * Normalizes question strings to maximize cache hits
 * e.g., "Can polyherbal formulations be patented under Section 3(p)?" -> "can polyherbal formulations be patented under section 3 p"
 */
export function generateCacheKey(question: string, language: string = "English"): string {
  const normalizedText = question
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0900-\u097F]/g, "") // preserve devanagari & alphanumeric
    .replace(/\s+/g, " ");

  return `ipsakti:rag:${language.toLowerCase()}:${normalizedText}`;
}

/**
 * Retrieves a cached RAG response from Redis -> MongoDB -> In-Memory
 */
export async function getCachedRAG(
  question: string,
  language: string = "English"
): Promise<CachedRAGData | null> {
  const cacheKey = generateCacheKey(question, language);
  const now = Date.now();

  // 1. Tier 1: Check In-Memory Cache (Sub-1ms)
  const memEntry = memoryCache.get(cacheKey);
  if (memEntry) {
    if (memEntry.expiresAt > now) {
      memEntry.data.hitCount = (memEntry.data.hitCount || 0) + 1;
      return memEntry.data;
    } else {
      memoryCache.delete(cacheKey);
    }
  }

  // 2. Tier 2: Check Redis Cache (< 10ms)
  const redis = getRedisInstance();
  if (redis) {
    try {
      const raw = await redis.get(cacheKey);
      if (raw) {
        const parsed: CachedRAGData = JSON.parse(raw);
        parsed.hitCount = (parsed.hitCount || 0) + 1;
        // Warm memory cache
        memoryCache.set(cacheKey, { data: parsed, expiresAt: now + 3600 * 1000 });
        return parsed;
      }
    } catch (err) {
      console.warn("Redis GET error:", err);
    }
  }

  // 3. Tier 3: Check MongoDB Shared RAG Cache (< 25ms)
  try {
    const mongo = await clientPromise;
    const db = mongo.db("ipsakti");
    const doc = await db.collection("rag_cache").findOne({ key: cacheKey });

    if (doc && doc.data && (!doc.expiresAt || new Date(doc.expiresAt).getTime() > now)) {
      const cachedData = doc.data as CachedRAGData;
      cachedData.hitCount = (doc.hitCount || 0) + 1;

      // Increment hit count asynchronously
      db.collection("rag_cache").updateOne(
        { key: cacheKey },
        { $inc: { hitCount: 1 }, $set: { lastAccessedAt: new Date() } }
      ).catch(() => {});

      // Warm memory cache
      memoryCache.set(cacheKey, { data: cachedData, expiresAt: now + 3600 * 1000 });
      return cachedData;
    }
  } catch (err) {
    console.warn("MongoDB Cache GET error:", err);
  }

  return null;
}

/**
 * Stores a RAG response into Redis, MongoDB, and In-Memory Cache with TTL
 */
export async function setCachedRAG(
  question: string,
  language: string = "English",
  payload: {
    answer: string;
    sources: any[];
    classification?: any;
    accuracyScore: number;
    similarityIndex: number;
  },
  ttlSeconds: number = 86400 * 3 // Default 3 days TTL
): Promise<void> {
  const cacheKey = generateCacheKey(question, language);
  const now = Date.now();
  const expiresAt = now + ttlSeconds * 1000;

  const dataToStore: CachedRAGData = {
    answer: payload.answer,
    sources: payload.sources || [],
    classification: payload.classification,
    accuracyScore: payload.accuracyScore,
    similarityIndex: payload.similarityIndex,
    cachedAt: new Date().toISOString(),
    hitCount: 1,
  };

  // 1. Store in In-Memory Cache
  if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(cacheKey, { data: dataToStore, expiresAt });

  // 2. Store in Redis Cache
  const redis = getRedisInstance();
  if (redis) {
    try {
      await redis.set(cacheKey, JSON.stringify(dataToStore), "EX", ttlSeconds);
    } catch (err) {
      console.warn("Redis SET error:", err);
    }
  }

  // 3. Store in MongoDB Shared RAG Cache
  try {
    const mongo = await clientPromise;
    const db = mongo.db("ipsakti");
    await db.collection("rag_cache").updateOne(
      { key: cacheKey },
      {
        $set: {
          key: cacheKey,
          question,
          language,
          data: dataToStore,
          updatedAt: new Date(),
          expiresAt: new Date(expiresAt),
        },
        $setOnInsert: { createdAt: new Date(), hitCount: 1 },
      },
      { upsert: true }
    );
  } catch (err) {
    console.warn("MongoDB Cache SET error:", err);
  }
}
