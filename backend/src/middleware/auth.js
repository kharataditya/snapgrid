const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JWT stored in httpOnly cookie or Bearer token header.
 */
const authenticate = (req, res, next) => {
  let token = null;

  // Prioritize Authorization header for isolated multi-tab and client sessions
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'snapgrid-secret-key-dbms-project-2026-secure';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

/**
 * Optional authentication middleware:
 * If a token is provided and valid, sets req.user.
 * If not provided or invalid, continues without req.user.
 */
const optionalAuth = (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'snapgrid-secret-key-dbms-project-2026-secure';
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
    } catch {
      // Ignore token failure for optional auth
      req.user = null;
    }
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth
};
