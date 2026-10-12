const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Test database connection on startup
pool
  .query('SELECT 1')
  .then(() => {
    console.log('Successfully connected to MySQL database.');
  })
  .catch((err) => {
    console.error('Failed to connect to MySQL database:', err.message);
  });

const server = app.listen(PORT, () => {
  console.log(`SnapGrid backend server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log('\nGracefully shutting down server...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await pool.end();
    console.log('MySQL connection pool closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
