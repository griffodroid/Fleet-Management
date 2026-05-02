// Fail fast if critical secrets are missing in production
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,

  // FIXED: No fallback secret — will throw in production if not set
  JWT_SECRET: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set');
    console.warn('WARNING: Using insecure default JWT_SECRET. Set JWT_SECRET in .env');
    return 'dev_secret_do_not_use_in_production';
  })(),
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@fleetmanagement.com',

  // FIXED: Alert email is now configurable, not hardcoded
  ALERT_EMAIL: process.env.ALERT_EMAIL || 'admin@fleetmanagement.com',

  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  MAX_QUEUE_RETRIES: parseInt(process.env.MAX_QUEUE_RETRIES || '3'),
  GEOFENCE_RADIUS_KM: parseFloat(process.env.GEOFENCE_RADIUS_KM || '5'),
  SPEED_ALERT_THRESHOLD: parseInt(process.env.SPEED_ALERT_THRESHOLD || '120'),
  ALERT_COOLDOWN_MINUTES: parseInt(process.env.ALERT_COOLDOWN_MINUTES || '10'),
  WS_PORT: process.env.WS_PORT || 8080,
  WS_HOST: process.env.WS_HOST || 'localhost',
};
