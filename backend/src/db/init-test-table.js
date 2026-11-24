const { readFile } = require('node:fs/promises');
const path = require('node:path');
const pool = require('./client');

async function initTestTable() {
  try {
    const sql = await readFile(path.join(__dirname, 'test-table.sql'), 'utf8');
    await pool.query(sql);
    await pool.query('SELECT id, created_at FROM public.connection_test LIMIT 1');
    console.log('PostgreSQL connection verified. public.connection_test is ready.');
  } finally {
    await pool.end();
  }
}

initTestTable().catch((error) => {
  console.error('Could not initialize the PostgreSQL test table:', error.message);
  process.exitCode = 1;
});
