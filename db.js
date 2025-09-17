// db.js
require('dotenv').config();
const { Pool } = require('pg');

let pool;

// Si existe DATABASE_URL, usamos esa conexión
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
} else {
  // Si no, usamos las variables separadas
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'postgres'
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
