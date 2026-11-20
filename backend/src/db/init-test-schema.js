const { readFile } = require('node:fs/promises');
const path = require('node:path');
const pool = require('./client');

async function initTestSchema() {
  try {
    const sql = await readFile(path.join(__dirname, 'test-schema.sql'), 'utf8');
    await pool.query(sql);
    await pool.query('SELECT id, created_at FROM bootstrap.connection_test LIMIT 1');
    console.log('PostgreSQL connection verified. bootstrap.connection_test is ready.');
  } finally {
    await pool.end();
  }
}

initTestSchema().catch((error) => {
  console.error('Could not initialize the PostgreSQL test schema:', error.message);
  process.exitCode = 1;
});
