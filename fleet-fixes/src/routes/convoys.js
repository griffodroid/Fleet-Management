const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { convoySchema, convoyUpdateSchema } = require('../utils/validators');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// FIXED: All routes require authentication
router.use(authenticate);

// GET /api/convoys - Get all convoys with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { status } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) FROM convoys ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM convoys ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
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
    logger.error('Error fetching convoys', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/convoys/:id - Get convoy by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM convoys WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Convoy not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching convoy', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/convoys - Create new convoy
router.post('/', async (req, res) => {
  try {
    const { error, value } = convoySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, start_point_lat, start_point_lng, end_point_lat, end_point_lng, risk_level } = value;
    const result = await query(
      'INSERT INTO convoys (name, start_point_lat, start_point_lng, end_point_lat, end_point_lng, risk_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, start_point_lat, start_point_lng, end_point_lat, end_point_lng, risk_level || 'medium']
    );

    logger.info('Convoy created', { id: result.rows[0].id, name });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating convoy', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/convoys/:id - Update convoy
// FIXED: validates body; COALESCE prevents null overwrites on partial updates
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = convoyUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, start_point_lat, start_point_lng, end_point_lat, end_point_lng, risk_level, status } = value;

    const result = await query(
      `UPDATE convoys SET
        name             = COALESCE($1, name),
        start_point_lat  = COALESCE($2, start_point_lat),
        start_point_lng  = COALESCE($3, start_point_lng),
        end_point_lat    = COALESCE($4, end_point_lat),
        end_point_lng    = COALESCE($5, end_point_lng),
        risk_level       = COALESCE($6, risk_level),
        status           = COALESCE($7, status),
        updated_at       = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, start_point_lat, start_point_lng, end_point_lat, end_point_lng, risk_level, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Convoy not found' });
    }

    logger.info('Convoy updated', { id });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating convoy', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/convoys/:id - Delete convoy
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM convoys WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Convoy not found' });
    }

    logger.info('Convoy deleted', { id });
    res.json({ message: 'Convoy deleted successfully' });
  } catch (error) {
    logger.error('Error deleting convoy', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
