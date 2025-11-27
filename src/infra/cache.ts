import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is not set');
}

const redis = new Redis(redisUrl);

export default redis;

export const getCache = async <T>(key: string): Promise<T | null> => {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    return null;
  }
};

export const setCache = async (key: string, value: unknown, ttlSeconds = 300) => {
  const raw = JSON.stringify(value);
  if (ttlSeconds > 0) {
    await redis.set(key, raw, 'EX', ttlSeconds);
  } else {
    await redis.set(key, raw);
  }
};

export const delCache = async (key: string) => {
  await redis.del(key);
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
