const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

// Cache management functions
const cacheManager = {
  // Set cache with expiry (in seconds)
  set: async (key, value, expiry = 3600) => {
    try {
      await client.setEx(key, expiry, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache
  get: async (key) => {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  delete: async (key) => {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Clear all cache for pattern
  clearPattern: async (pattern) => {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache clear pattern error:', error);
      return false;
    }
  },

  // Increment counter
  increment: async (key, amount = 1, expiry = 3600) => {
    try {
      const result = await client.incrBy(key, amount);
      if (result === amount) {
        await client.expire(key, expiry);
      }
      return result;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  },

  // Check rate limit
  checkRateLimit: async (key, limit, windowSeconds) => {
    try {
      const current = await cacheManager.increment(key, 1, windowSeconds);
      return current <= limit;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Allow on error
    }
  },
};

module.exports = { client, cacheManager };
