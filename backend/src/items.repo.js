const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SORTS = {
  newest: 'occurred_on DESC, id DESC',
  oldest: 'occurred_on ASC, id ASC',
};

async function findItems({ search, kind, category, status, sort = 'newest', limit = 24, page = 1 }) {
  const where = [];
  const values = [];

  if (search) {
    values.push(search);
    where.push(
      `to_tsvector('english', title || ' ' || description || ' ' || location)
       @@ plainto_tsquery('english', $${values.length})`
    );
  }
  if (kind) {
    values.push(kind);
    where.push(`kind = $${values.length}`);
  }
  if (category) {
    values.push(category);
    where.push(`category = $${values.length}`);
  }
  if (status) {
    values.push(status);
    where.push(`status = $${values.length}`);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = SORTS[sort] || SORTS.newest;
  const safeLimit = Math.min(Number(limit) || 24, 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;

  values.push(safeLimit, offset);

  const { rows } = await pool.query(
    `SELECT *, COUNT(*) OVER() AS total_count
       FROM items
       ${clause}
       ORDER BY ${orderBy}
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  const total = rows.length ? Number(rows[0].total_count) : 0;
  return {
    items: rows.map(({ total_count, ...item }) => item),
    total,
    page: Math.max(Number(page) || 1, 1),
    pageSize: safeLimit,
  };
}

async function findItemById(id) {
  const { rows } = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createItem(item) {
  const { rows } = await pool.query(
    `INSERT INTO items
       (case_number, title, description, category, kind, location,
        occurred_on, contact_name, contact_email, photo_url)
     VALUES (
       'LF-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('items_id_seq')::text, 4, '0'),
       $1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [item.title, item.description, item.category, item.kind, item.location,
     item.occurred_on, item.contact_name, item.contact_email, item.photo_url || null]
  );
  return rows[0];
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE items SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0] || null;
}

module.exports = { pool, findItems, findItemById, createItem, updateStatus };
