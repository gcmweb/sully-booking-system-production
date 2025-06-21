const { Pool } = require('pg');

let pool;

function createPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Creating database pool...');
    
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });

    pool.on('connect', () => {
      console.log('Database connected successfully');
    });
  }
  
  return pool;
}

async function query(text, params) {
  const client = createPool();
  
  try {
    console.log('Executing query:', text.substring(0, 100) + '...');
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed successfully in', duration, 'ms');
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

module.exports = {
  query,
  testConnection,
  pool: () => createPool()
};