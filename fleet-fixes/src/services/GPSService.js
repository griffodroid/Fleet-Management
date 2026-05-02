const { haversineDistance } = require('../utils/haversine');
const config = require('../config');

// FIXED: GPSService was a hollow stub. Core logic is now implemented here
// and the gpsWorker delegates to this service for testability.
class GPSService {
  /**
   * Processes and validates an incoming GPS reading.
   * Returns a structured object with derived flags.
   */
  processLocation(data) {
    const { vehicle_id, lat, lng, speed, timestamp } = data;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error(`Invalid coordinates: lat=${lat}, lng=${lng}`);
    }
    if (speed < 0 || speed > 500) {
      throw new Error(`Implausible speed value: ${speed}`);
    }

    return {
      vehicle_id,
      lat,
      lng,
      speed,
      timestamp: timestamp || new Date().toISOString(),
      isSpeeding: speed > config.SPEED_ALERT_THRESHOLD,
    };
  }

  /**
   * FIXED: Calculates the perpendicular distance from a point to a route
   * defined as a line segment between start and end coordinates.
   * Uses proper point-to-segment projection (not midpoint approximation).
   *
   * @param {number} pLat  - Vehicle latitude
   * @param {number} pLng  - Vehicle longitude
   * @param {number} aLat  - Route start latitude
   * @param {number} aLng  - Route start longitude
   * @param {number} bLat  - Route end latitude
   * @param {number} bLng  - Route end longitude
   * @returns {number} Distance in kilometres
   */
  geofenceCheck(pLat, pLng, aLat, aLng, bLat, bLng) {
    const toRad = (d) => (d * Math.PI) / 180;

    // Convert to 3D unit-sphere vectors
    const vec = (lat, lng) => ({
      x: Math.cos(toRad(lat)) * Math.cos(toRad(lng)),
      y: Math.cos(toRad(lat)) * Math.sin(toRad(lng)),
      z: Math.sin(toRad(lat)),
    });

    const A = vec(aLat, aLng);
    const B = vec(bLat, bLng);
    const P = vec(pLat, pLng);

    const ab = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
    const ap = { x: P.x - A.x, y: P.y - A.y, z: P.z - A.z };

    const abDotAb = ab.x ** 2 + ab.y ** 2 + ab.z ** 2;
    const apDotAb = ap.x * ab.x + ap.y * ab.y + ap.z * ab.z;

    // Clamp t ∈ [0, 1] — so we measure to the segment, not the infinite line
    const t = abDotAb === 0 ? 0 : Math.max(0, Math.min(1, apDotAb / abDotAb));

    const closestLat = aLat + t * (bLat - aLat);
    const closestLng = aLng + t * (bLng - aLng);

    return haversineDistance(pLat, pLng, closestLat, closestLng);
  }

  /**
   * Returns true if the vehicle is outside the allowed geofence radius.
   */
  isOutsideGeofence(pLat, pLng, aLat, aLng, bLat, bLng) {
    const distance = this.geofenceCheck(pLat, pLng, aLat, aLng, bLat, bLng);
    return {
      outside: distance > config.GEOFENCE_RADIUS_KM,
      distanceKm: distance,
    };
  }
}

module.exports = new GPSService();
