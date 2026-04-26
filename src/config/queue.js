const { Queue } = require('bullmq');
const redis = require('./redis');
require('dotenv').config();

const createDummyQueue = () => ({
  add: async () => Promise.resolve(),
  on: () => {},
  close: async () => Promise.resolve(),
});

const dummyQueue = createDummyQueue();
let gpsQueue = dummyQueue;
let alertQueue = dummyQueue;
let notificationQueue = dummyQueue;

const redisReady = () => redis && redis.status === 'ready';
const redisConfigured = Boolean(process.env.REDIS_URL);

if (redisConfigured && redisReady()) {
  try {
    gpsQueue = new Queue('gps', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    alertQueue = new Queue('alerts', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    notificationQueue = new Queue('notifications', {
      connection: redis,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    const shouldLogQueueError = (err) => {
      if (!err || !err.message) return false;
      const msg = err.message;
      return !msg.includes('ECONNREFUSED') &&
             !msg.includes('Connection is closed') &&
             !msg.includes('connect');
    };

    gpsQueue.on('error', (err) => {
      if (shouldLogQueueError(err)) {
        console.error('[GPS Queue] Error:', err.message);
      }
    });

    alertQueue.on('error', (err) => {
      if (shouldLogQueueError(err)) {
        console.error('[Alert Queue] Error:', err.message);
      }
    });

    notificationQueue.on('error', (err) => {
      if (shouldLogQueueError(err)) {
        console.error('[Notification Queue] Error:', err.message);
      }
    });
  } catch (error) {
    console.error('Failed to initialize queues:', error.message);
    gpsQueue = dummyQueue;
    alertQueue = dummyQueue;
    notificationQueue = dummyQueue;
  }
} else if (!redisConfigured) {
  console.info('[Queue] Redis not configured, using dummy queues');
} else {
  console.info('[Queue] Redis not ready yet, using dummy queues');
}

module.exports = {
  gpsQueue,
  alertQueue,
  notificationQueue,
};