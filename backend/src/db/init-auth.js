const { readFile } = require('node:fs/promises');
const path = require('node:path');
const pool = require('./client');

async function initAuth() {
  try {
    const sql = await readFile(path.join(__dirname, 'auth.sql'), 'utf8');
    await pool.query(sql);
    console.log('Authentication tables are ready.');
  } finally {
    await pool.end();
  }
}

initAuth().catch((error) => {
  console.error('Could not initialize authentication tables:', error.message);
  process.exitCode = 1;
});
