import { createClient } from 'redis';

const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Initialize connection
redisClient.connect().catch(console.error);

// Cache utility functions
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, value: string, ttl?: number): Promise<void> => {
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export const cacheFlush = async (): Promise<void> => {
  try {
    await redisClient.flushAll();
  } catch (error) {
    console.error('Redis flush error:', error);
  }
}; 