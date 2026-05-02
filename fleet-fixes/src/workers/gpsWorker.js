const { Worker } = require('bullmq');
const { query } = require('../config/database');
const queue = require('../config/queue');
const { haversineDistance } = require('../utils/haversine');
const logger = require('../utils/logger');
const config = require('../config');

const createGpsWorker = (redisConnection) => {
  const gpsWorker = new Worker('gps', async (job) => {
    const { vehicle_id, lat, lng, speed, timestamp } = job.data;

    try {
      logger.info('Processing GPS data', { vehicle_id, lat, lng, speed });

      // Store raw GPS data
      await query(
        'INSERT INTO gps_logs (vehicle_id, lat, lng, speed, timestamp) VALUES ($1, $2, $3, $4, $5)',
        [vehicle_id, lat, lng, speed, timestamp]
      );

      // --- 1. Speed alert (with cooldown) ---
      if (speed > config.SPEED_ALERT_THRESHOLD) {
        const shouldAlert = await checkCooldown(vehicle_id, 'speeding');
        if (shouldAlert) {
          await queue.alertQueue.add('create-alert', {
            vehicle_id,
            type: 'speeding',
            message: `Vehicle ${vehicle_id} exceeded speed limit: ${speed} km/h`,
            severity: 'high',
          });
        }
      }

      // --- 2. Geofence check (with cooldown and correct algorithm) ---
      try {
        const vehicleResult = await query('SELECT convoy_id FROM vehicles WHERE id = $1', [vehicle_id]);
        if (vehicleResult.rows.length > 0 && vehicleResult.rows[0].convoy_id) {
          const convoyId = vehicleResult.rows[0].convoy_id;
          const convoyResult = await query('SELECT * FROM convoys WHERE id = $1', [convoyId]);

          if (convoyResult.rows.length > 0) {
            const convoy = convoyResult.rows[0];
            // FIXED: proper point-to-line-segment distance, not midpoint approximation
            const distanceToRoute = pointToSegmentDistance(
              lat, lng,
              convoy.start_point_lat, convoy.start_point_lng,
              convoy.end_point_lat, convoy.end_point_lng
            );

            if (distanceToRoute > config.GEOFENCE_RADIUS_KM) {
              const shouldAlert = await checkCooldown(vehicle_id, 'geofence');
              if (shouldAlert) {
                await queue.alertQueue.add('create-alert', {
                  vehicle_id,
                  type: 'geofence',
                  message: `Vehicle ${vehicle_id} deviated from convoy route by ${distanceToRoute.toFixed(2)} km`,
                  severity: 'medium',
                });
              }
            }
          }
        }
      } catch (geoError) {
        logger.warn('Geofencing check failed', { error: geoError.message, vehicle_id });
      }

      // --- 3. Broadcast GPS update via WebSocket ---
      if (global.wsManager) {
        global.wsManager.broadcast({
          type: 'gps_update',
          vehicle_id,
          lat,
          lng,
          speed,
          timestamp,
        });
      }

      logger.info('GPS data processed successfully', { vehicle_id });
    } catch (error) {
      logger.error('Error processing GPS data', { error: error.message, vehicle_id });
      throw error;
    }
  }, { connection: redisConnection });

  gpsWorker.on('completed', (job) => {
    logger.info('GPS job completed', { jobId: job.id });
  });

  gpsWorker.on('failed', (job, err) => {
    logger.error('GPS job failed', { jobId: job.id, error: err.message });
  });

  return gpsWorker;
};

/**
 * FIXED: Check whether enough time has passed since the last alert of this type
 * for this vehicle, honouring ALERT_COOLDOWN_MINUTES from config.
 */
async function checkCooldown(vehicle_id, type) {
  try {
    const cooldownMs = config.ALERT_COOLDOWN_MINUTES * 60 * 1000;
    const result = await query(
      `SELECT created_at FROM alerts
       WHERE vehicle_id = $1 AND type = $2
       ORDER BY created_at DESC LIMIT 1`,
      [vehicle_id, type]
    );

    if (result.rows.length === 0) return true; // no previous alert — fire
    const lastAlertTime = new Date(result.rows[0].created_at).getTime();
    return Date.now() - lastAlertTime > cooldownMs;
  } catch (err) {
    logger.warn('Cooldown check failed, defaulting to allow alert', { vehicle_id, type, error: err.message });
    return true;
  }
}

/**
 * FIXED: True point-to-line-segment distance using haversine.
 * Projects point P onto segment AB, clamps t to [0,1], then measures
 * distance from P to the closest point on the segment.
 *
 * This replaces the midpoint approximation which gave large errors for
 * long routes (e.g. 200 km routes had up to 100 km of error).
 */
function pointToSegmentDistance(pLat, pLng, aLat, aLng, bLat, bLng) {
  // Convert to radians for dot-product projection
  const toRad = (d) => (d * Math.PI) / 180;

  const ax = Math.cos(toRad(aLat)) * Math.cos(toRad(aLng));
  const ay = Math.cos(toRad(aLat)) * Math.sin(toRad(aLng));
  const az = Math.sin(toRad(aLat));

  const bx = Math.cos(toRad(bLat)) * Math.cos(toRad(bLng));
  const by = Math.cos(toRad(bLat)) * Math.sin(toRad(bLng));
  const bz = Math.sin(toRad(bLat));

  const px = Math.cos(toRad(pLat)) * Math.cos(toRad(pLng));
  const py = Math.cos(toRad(pLat)) * Math.sin(toRad(pLng));
  const pz = Math.sin(toRad(pLat));

  // Vector AB
  const abx = bx - ax, aby = by - ay, abz = bz - az;
  // Vector AP
  const apx = px - ax, apy = py - ay, apz = pz - az;

  const abDotAb = abx * abx + aby * aby + abz * abz;
  const apDotAb = apx * abx + apy * aby + apz * abz;

  // Clamp t to [0, 1] so we measure to the segment, not the full line
  const t = abDotAb === 0 ? 0 : Math.max(0, Math.min(1, apDotAb / abDotAb));

  // Closest point on segment
  const closestLat = aLat + t * (bLat - aLat);
  const closestLng = aLng + t * (bLng - aLng);

  return haversineDistance(pLat, pLng, closestLat, closestLng);
}

module.exports = createGpsWorker;
