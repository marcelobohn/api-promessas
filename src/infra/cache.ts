import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is not set');
}

const redis = new Redis(redisUrl);

export default redis;

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await redis.get(key);
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
  try {
    const raw = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.set(key, raw, 'EX', ttlSeconds);
    } else {
      await redis.set(key, raw);
    }
  } catch (err) {
    console.warn('Cache set failed for key', key, err);
  }
};

export const delCache = async (key: string) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.warn('Cache delete failed for key', key, err);
  }
};

export const delByPattern = async (pattern: string) => {
  // Use scanStream to avoid blocking Redis (keys can be expensive on large datasets)
  const stream = redis.scanStream({ match: pattern, count: 100 });

  return new Promise<void>((resolve, reject) => {
    stream.on('data', (resultKeys: string[]) => {
      if (!resultKeys || resultKeys.length === 0) return;
      // delete in small batches to avoid exceeding argument limits
      for (let i = 0; i < resultKeys.length; i += 500) {
        const chunk = resultKeys.slice(i, i + 500);
        const pipeline = redis.pipeline();
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
