const { query } = require('../config/database');

// FIXED: Vehicle model was entirely unimplemented — all methods are now functional
class Vehicle {
  constructor(row) {
    this.id = row.id;
    this.plateNumber = row.plate_number;
    this.make = row.make;
    this.model = row.model;
    this.year = row.year;
    this.status = row.status;
    this.convoyId = row.convoy_id;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  static async create(vehicleData) {
    const { plate_number, make, model, year } = vehicleData;
    const result = await query(
      'INSERT INTO vehicles (plate_number, make, model, year) VALUES ($1, $2, $3, $4) RETURNING *',
      [plate_number, make, model, year]
    );
    return new Vehicle(result.rows[0]);
  }

  static async findById(id) {
    const result = await query('SELECT * FROM vehicles WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return new Vehicle(result.rows[0]);
  }

  static async findAll({ page = 1, limit = 20, status, search } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(plate_number ILIKE $${params.length} OR make ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query(`SELECT COUNT(*) FROM vehicles ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM vehicles ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      data: result.rows.map((r) => new Vehicle(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async update(id, vehicleData) {
    const { plate_number, make, model, year, status, convoy_id } = vehicleData;
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
    if (result.rows.length === 0) return null;
    return new Vehicle(result.rows[0]);
  }

  static async delete(id) {
    const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return null;
    return new Vehicle(result.rows[0]);
  }

  toJSON() {
    return {
      id: this.id,
      plateNumber: this.plateNumber,
      make: this.make,
      model: this.model,
      year: this.year,
      status: this.status,
      convoyId: this.convoyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Vehicle;
