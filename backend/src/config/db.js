const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();

// Parse DATABASE_URL if provided, else use individual env vars
let poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'snapgrid_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    poolConfig.host = url.hostname || poolConfig.host;
    poolConfig.port = url.port ? parseInt(url.port, 10) : poolConfig.port;
    poolConfig.user = url.username || poolConfig.user;
    poolConfig.password = url.password || poolConfig.password;
    if (url.pathname && url.pathname.length > 1) {
      poolConfig.database = url.pathname.slice(1);
    }
  } catch (err) {
    console.warn('Could not parse DATABASE_URL, using default MySQL config:', err.message);
  }
}

const pool = mysql.createPool(poolConfig);

/**
 * Universal query wrapper for MySQL.
 * - Converts $1, $2, ... placeholders to ? for seamless compatibility
 * - Returns { rows, insertId, affectedRows }
 */
const query = async (sqlText, params = []) => {
  let mysqlSql = sqlText;
  let finalParams = params;

  // If query uses Postgres-style $1, $2 placeholders, map each to ? and expand params accordingly
  if (/\$\d+/.test(sqlText)) {
    finalParams = [];
    mysqlSql = sqlText.replace(/\$(\d+)/g, (_, num) => {
      const idx = parseInt(num, 10) - 1;
      finalParams.push(params[idx]);
      return '?';
    });
  }

  const [result] = await pool.query(mysqlSql, finalParams);

  if (Array.isArray(result)) {
    return {
      rows: result,
      insertId: null,
      affectedRows: result.length
    };
  }

  return {
    rows: [],
    insertId: result?.insertId || null,
    affectedRows: result?.affectedRows || 0
  };
};

module.exports = {
  pool,
  query
};
