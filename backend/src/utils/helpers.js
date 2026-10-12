const jwt = require('jsonwebtoken');

/**
 * Generate a JSON Web Token for authenticated user.
 * @param {object} payload - Data to sign into token
 * @returns {string} - Signed JWT
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'snapgrid-secret-key-dbms-project-2026-secure';
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Get cookie options for JWT auth token.
 * @returns {object} - Express cookie options
 */
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
};

/**
 * Sanitize user object to ensure sensitive fields like password_hash are removed.
 * @param {object} user - User record from database
 * @returns {object} - Sanitized user object
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

/**
 * Wrapper for async route controllers to catch errors and pass to next().
 * @param {Function} fn - Async controller function
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  generateToken,
  getCookieOptions,
  sanitizeUser,
  asyncHandler
};
