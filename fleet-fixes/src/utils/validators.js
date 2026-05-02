const Joi = require('joi');

// GPS data validation schema
// FIXED: vehicle_id is a UUID string to match DB schema, not an integer
const gpsDataSchema = Joi.object({
  vehicle_id: Joi.string().uuid().required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  speed: Joi.number().min(0).max(500).required(),
  timestamp: Joi.date().optional(),
});

// Vehicle creation schema
const vehicleSchema = Joi.object({
  plate_number: Joi.string().min(2).max(20).required(),
  make: Joi.string().max(100).optional(),
  model: Joi.string().max(100).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
});

// FIXED: Separate update schema — all fields optional so partial updates are valid
// COALESCE in the route query prevents nulls from overwriting existing values
const vehicleUpdateSchema = Joi.object({
  plate_number: Joi.string().min(2).max(20).optional(),
  make: Joi.string().max(100).optional(),
  model: Joi.string().max(100).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  status: Joi.string().valid('active', 'idle', 'maintenance', 'deployed').optional(),
  convoy_id: Joi.string().uuid().allow(null).optional(),
});

// Convoy creation schema
const convoySchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  start_point_lat: Joi.number().min(-90).max(90).required(),
  start_point_lng: Joi.number().min(-180).max(180).required(),
  end_point_lat: Joi.number().min(-90).max(90).required(),
  end_point_lng: Joi.number().min(-180).max(180).required(),
  risk_level: Joi.string().valid('low', 'medium', 'high').optional(),
});

// FIXED: Separate update schema — all fields optional
const convoyUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  start_point_lat: Joi.number().min(-90).max(90).optional(),
  start_point_lng: Joi.number().min(-180).max(180).optional(),
  end_point_lat: Joi.number().min(-90).max(90).optional(),
  end_point_lng: Joi.number().min(-180).max(180).optional(),
  risk_level: Joi.string().valid('low', 'medium', 'high').optional(),
  status: Joi.string().valid('planned', 'active', 'completed', 'archived').optional(),
});

module.exports = {
  gpsDataSchema,
  vehicleSchema,
  vehicleUpdateSchema,
  convoySchema,
  convoyUpdateSchema,
};
