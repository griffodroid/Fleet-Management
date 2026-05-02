const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { vehicleSchema, vehicleUpdateSchema } = require('../utils/validators');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// FIXED: All routes require authentication
router.use(authenticate);

// GET /api/vehicles - Get all vehicles with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    // Build dynamic WHERE clause
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(plate_number ILIKE $${params.length} OR make ILIKE $${params.length} OR model ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total for pagination
    const countResult = await query(`SELECT COUNT(*) FROM vehicles ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM vehicles ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching vehicles', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vehicles/:id - Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching vehicle', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vehicles - Create new vehicle
router.post('/', async (req, res) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { plate_number, make, model, year } = value;
    const result = await query(
      'INSERT INTO vehicles (plate_number, make, model, year) VALUES ($1, $2, $3, $4) RETURNING *',
      [plate_number, make, model, year]
    );

    logger.info('Vehicle created', { id: result.rows[0].id, plate_number });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Plate number already exists' });
    }
    logger.error('Error creating vehicle', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/vehicles/:id - Full update (all fields required)
// FIXED: validates request body before touching DB; uses COALESCE to prevent null overwrites
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = vehicleUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { plate_number, make, model, year, status, convoy_id } = value;

    const result = await query(
      `UPDATE vehicles SET
        plate_number = COALESCE($1, plate_number),
        make         = COALESCE($2, make),
        model        = COALESCE($3, model),
        year         = COALESCE($4, year),
        status       = COALESCE($5, status),
        convoy_id    = COALESCE($6, convoy_id),
        updated_at   = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [plate_number, make, model, year, status, convoy_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    logger.info('Vehicle updated', { id });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Plate number already exists' });
    }
    logger.error('Error updating vehicle', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    logger.info('Vehicle deleted', { id });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    logger.error('Error deleting vehicle', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
