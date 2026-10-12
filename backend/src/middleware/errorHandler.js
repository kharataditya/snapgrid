/**
 * Centralized error handling middleware.
 * Maps MySQL error codes (and legacy PostgreSQL codes) to readable HTTP responses.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error encountered:', {
    message: err.message,
    code: err.code,
    errno: err.errno,
    sqlState: err.sqlState,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  // MySQL & Postgres unique violation error (ER_DUP_ENTRY: 1062, Postgres: 23505)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062 || err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Conflict: Record with given identifier already exists.',
      detail: err.message || null
    });
  }

  // MySQL & Postgres foreign key violation error (ER_NO_REFERENCED_ROW_2: 1452, Postgres: 23503)
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452 || err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Referenced resource does not exist.',
      detail: err.message || null
    });
  }

  // MySQL & Postgres check constraint violation (ER_CHECK_CONSTRAINT_VIOLATED: 3819, Postgres: 23514)
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.errno === 3819 || err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Data violates constraint.',
      detail: err.message || null
    });
  }

  // MySQL & Postgres invalid input syntax (e.g. invalid integer for IDs)
  if (err.code === '22P02' || err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Invalid parameter or field format.'
    });
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found middleware for undefined routes.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Not Found - Route ${req.originalUrl} does not exist.`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
