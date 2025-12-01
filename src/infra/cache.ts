import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const isTest = !redisUrl || process.env.NODE_ENV === 'test';

let redis: Redis | null = null;
if (!isTest) {
  redis = new Redis(redisUrl);
}

export const redisClient = (redis as unknown) as Redis;

// In-memory store used when running tests or no REDIS_URL provided
const store = new Map<string, { value: string; expiresAt?: number }>();
const cleanupExpired = () => {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt && v.expiresAt <= now) store.delete(k);
  }
};
setInterval(cleanupExpired, 1000).unref();

const matchPattern = (key: string, pattern: string) => {
  if (pattern === '*') return true;
  if (pattern.endsWith('*')) return key.startsWith(pattern.slice(0, -1));
  return key === pattern;
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (isTest) {
    cleanupExpired();
    const entry = store.get(key);
    if (!entry) return null;
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return null;
    }
  }

  try {
    const raw = await redis!.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  } catch (err) {
    console.warn('Cache get failed for key', key, err);
    return null;
  }
};

export const setCache = async (key: string, value: unknown, ttlSeconds = 300) => {
  if (isTest) {
    const raw = JSON.stringify(value);
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined;
    store.set(key, { value: raw, expiresAt });
    return;
  }

  try {
    const raw = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis!.set(key, raw, 'EX', ttlSeconds);
    } else {
      await redis!.set(key, raw);
    }
  } catch (err) {
    console.warn('Cache set failed for key', key, err);
  }
};

export const delCache = async (key: string) => {
  if (isTest) {
    store.delete(key);
    return;
  }

  try {
    await redis!.del(key);
  } catch (err) {
    console.warn('Cache delete failed for key', key, err);
  }
};

export const delByPattern = async (pattern: string) => {
  if (isTest) {
    for (const key of Array.from(store.keys())) {
      if (matchPattern(key, pattern)) store.delete(key);
    }
    return;
  }

  const stream = redis!.scanStream({ match: pattern, count: 100 });

  return new Promise<void>((resolve, reject) => {
    stream.on('data', (resultKeys: string[]) => {
      if (!resultKeys || resultKeys.length === 0) return;
      for (let i = 0; i < resultKeys.length; i += 500) {
        const chunk = resultKeys.slice(i, i + 500);
        const pipeline = redis!.pipeline();
        chunk.forEach((k) => pipeline.del(k));
        pipeline.exec().catch(() => {
          // ignore individual pipeline errors
        });
      }
    });

    stream.on('end', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};

