const bcrypt = require('bcrypt');
const db = require('../config/db');
const { generateToken, getCookieOptions, sanitizeUser, asyncHandler } = require('../utils/helpers');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, full_name } = req.body;

  // Check if username or email already exists
  const existingUserCheck = await db.query(
    'SELECT user_id, username, email FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
    [email, username]
  );

  if (existingUserCheck.rows.length > 0) {
    const existing = existingUserCheck.rows[0];
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }
    if (existing.username.toLowerCase() === username.toLowerCase()) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken.'
      });
    }
  }

  // Hash password with 10 salt rounds
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Insert user into MySQL
  const insertQuery = `
    INSERT INTO users (username, email, password_hash, full_name)
    VALUES ($1, $2, $3, $4)
  `;

  const insertResult = await db.query(insertQuery, [
    username,
    email,
    passwordHash,
    full_name
  ]);

  const newUserId = insertResult.insertId;

  // Fetch newly created user record
  const fetchResult = await db.query(
    'SELECT user_id, username, email, full_name, bio, profile_image_url, created_at FROM users WHERE user_id = $1',
    [newUserId]
  );

  const newUser = fetchResult.rows[0];

  // Generate JWT and set httpOnly cookie
  const token = generateToken({
    user_id: newUser.user_id,
    username: newUser.username,
    email: newUser.email
  });

  res.cookie('token', token, getCookieOptions());

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    user: newUser,
    token
  });
});

/**
 * Log in an existing user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Retrieve user by email or username with password_hash
  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)';
  const result = await db.query(query, [email]);

  if (result.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const user = result.rows[0];

  // Compare password with stored hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  // Generate JWT and set httpOnly cookie
  const token = generateToken({
    user_id: user.user_id,
    username: user.username,
    email: user.email
  });

  res.cookie('token', token, getCookieOptions());

  // Fetch aggregate counts for logged in user
  const statsQuery = `
    SELECT
      (SELECT COUNT(*) FROM posts WHERE user_id = $1) as post_count,
      (SELECT COUNT(*) FROM follows WHERE following_id = $1) as follower_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count
  `;
  const statsResult = await db.query(statsQuery, [user.user_id]);
  const stats = statsResult.rows[0] || {};

  const safeUser = {
    ...sanitizeUser(user),
    post_count: parseInt(stats.post_count || 0, 10),
    follower_count: parseInt(stats.follower_count || 0, 10),
    following_count: parseInt(stats.following_count || 0, 10)
  };

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    user: safeUser,
    token
  });
});

/**
 * Get currently authenticated user from JWT session
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const query = `
    SELECT u.user_id, u.username, u.email, u.full_name, u.bio, u.profile_image_url, u.created_at,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.user_id) as post_count,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.user_id) as follower_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.user_id) as following_count
    FROM users u
    WHERE u.user_id = $1
  `;

  const result = await db.query(query, [userId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  const user = result.rows[0];
  user.post_count = parseInt(user.post_count || 0, 10);
  user.follower_count = parseInt(user.follower_count || 0, 10);
  user.following_count = parseInt(user.following_count || 0, 10);

  res.status(200).json({
    success: true,
    user
  });
});

/**
 * Log out user and clear JWT cookie
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout
};
