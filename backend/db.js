const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'Hello@',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  database: process.env.PGDATABASE || 'attendance_db'
});

// Log unexpected errors from the pool
pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error', err);
});

// Perform a quick connectivity check on startup to surface configuration/credential issues
pool.query('SELECT NOW()')
  .then((res) => {
    console.log('Postgres connected, now=', res.rows[0].now);
  })
  .catch((err) => {
    console.error('Postgres connectivity check failed:', err && err.message ? err.message : err);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
