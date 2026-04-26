require('dotenv').config();
const { server, wsManager } = require('./app');
const config = require('./config');
const { createTables } = require('./utils/setupDb');
const logger = require('./utils/logger');
const redis = require('./config/redis');

// Start workers only if Redis is available
if (redis && redis.status !== 'connecting' && redis.connected) {
  require('./workers/gpsWorker');
  require('./workers/alertWorker');
  require('./workers/notificationWorker');
  console.log('Workers initialized successfully');
} else {
  console.log('Redis not available, skipping worker initialization');
}

// Make wsManager available globally for workers
global.wsManager = wsManager;

const PORT = config.PORT;

async function startServer() {
  try {
    // Try to create database tables (will skip gracefully if DB not available)
    await createTables();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    // Always try to start the server, even if DB setup fails
    // Railway will provide services later
    server.listen(PORT, () => {
      logger.warn(`Server running on port ${PORT} without full database setup`);
    });
  }
}

startServer();