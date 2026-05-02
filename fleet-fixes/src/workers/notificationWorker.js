const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const config = require('../config');

const createNotificationWorker = (redisConnection) => {
  let transporter = null;

  if (config.SMTP_HOST && config.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: Number(config.SMTP_PORT) === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASSWORD,
      },
    });
  }

  const notificationWorker = new Worker('notifications', async (job) => {
    const { vehicle_id, type, message, severity } = job.data;

    try {
      logger.info('Sending notification', { vehicle_id, type, severity });

      if (transporter) {
        const mailOptions = {
          from: config.SMTP_FROM,
          // FIXED: uses configurable ALERT_EMAIL from config/index.js and .env
          to: config.ALERT_EMAIL,
          subject: `Fleet Alert: ${type.toUpperCase()} — Vehicle ${vehicle_id}`,
          text: message,
          html: `
            <h2 style="color:#c0392b">Fleet Management Alert</h2>
            <table>
              <tr><td><strong>Alert Type</strong></td><td>${type}</td></tr>
              <tr><td><strong>Vehicle ID</strong></td><td>${vehicle_id}</td></tr>
              <tr><td><strong>Severity</strong></td><td>${severity}</td></tr>
              <tr><td><strong>Message</strong></td><td>${message}</td></tr>
              <tr><td><strong>Time</strong></td><td>${new Date().toISOString()}</td></tr>
            </table>
          `,
        };

        await transporter.sendMail(mailOptions);
        logger.info('Email notification sent successfully', { vehicle_id, type, to: config.ALERT_EMAIL });
      } else {
        logger.warn('SMTP not configured, skipping email notification', { vehicle_id, type });
      }
    } catch (error) {
      logger.error('Error sending notification', { error: error.message, vehicle_id });
      throw error;
    }
  }, { connection: redisConnection });

  notificationWorker.on('completed', (job) => {
    logger.info('Notification job completed', { jobId: job.id });
  });

  notificationWorker.on('failed', (job, err) => {
    logger.error('Notification job failed', { jobId: job.id, error: err.message });
  });

  return notificationWorker;
};

module.exports = createNotificationWorker;
