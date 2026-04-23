const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.CHARS_DB_NAME || 'acore_characters',
  waitForConnections: true,
  connectionLimit: 5,
  timezone: '+00:00',
});

module.exports = pool;
