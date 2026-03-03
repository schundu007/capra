// PostgreSQL connection pool - dynamically imported only when DATABASE_URL is set
let pool = null;

// Initialize pool only if DATABASE_URL is configured
if (process.env.DATABASE_URL) {
  try {
    const pg = await import('pg');
    const { Pool } = pg.default;
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  } catch (err) {
    console.warn('[Database] pg module not available, database features disabled');
  }
}

/**
 * Check if database is configured
 */
export function isDatabaseConfigured() {
  return !!process.env.DATABASE_URL;
}

/**
 * Execute a query
 */
export async function query(text, params) {
  if (!pool) {
    throw new Error('Database not configured');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG === 'true') {
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Get a client from the pool (for transactions)
 */
export async function getClient() {
  if (!pool) {
    throw new Error('Database not configured');
  }
  return pool.connect();
}

/**
 * Initialize user's Ascend data
 */
export async function initUser(userId) {
  await query('SELECT ascend_init_user($1)', [userId]);
}

export default { query, getClient, isDatabaseConfigured, initUser };
