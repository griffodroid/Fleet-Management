const Redis = require('ioredis');
require('dotenv').config();

let redis = null;
const redisUrl = process.env.REDIS_URL || (process.env.NODE_ENV !== 'production' ? 'redis://127.0.0.1:6379' : null);

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true, // Don't connect immediately
    });

    redis.on('error', (err) => {
      if (!err || !err.message) return;
      if (!err.message.includes('ECONNREFUSED') && !err.message.includes('connect')) {
        console.error('Redis error:', err.message);
      }
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected');
    });

    redis.on('ready', () => {
      console.log('[Redis] Ready');
    });
  } catch (error) {
    console.error('Failed to initialize Redis client:', error.message);
    redis = {
      on: () => {},
      emit: () => {},
      connected: false,
      status: 'end',
    };
  }
} else {
  console.info('[Redis] No REDIS_URL configured; Redis client disabled');
  redis = {
    on: () => {},
    emit: () => {},
    connected: false,
    status: 'end',
  };
}

module.exports = redis;