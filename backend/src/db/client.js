const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to connect to PostgreSQL');
}

module.exports = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
