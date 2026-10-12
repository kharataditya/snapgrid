const db = require('../config/db');
const { asyncHandler } = require('../utils/helpers');

/**
 * Search users by username or full name
 * GET /api/users/search?q=
 */
const searchUsers = asyncHandler(async (req, res) => {
  const queryParam = req.query.q ? req.query.q.trim() : '';
  const currentUserId = req.user ? req.user.user_id : null;

  if (!queryParam) {
    // Return popular/suggested users for explore discovery
    const suggestedQuery = `
      SELECT u.user_id, u.username, u.full_name, u.bio, u.profile_image_url,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.user_id) as follower_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.user_id) as post_count,
        EXISTS(
          SELECT 1 FROM follows
          WHERE follower_id = $1 AND following_id = u.user_id
        ) as is_following
      FROM users u
      WHERE u.user_id != COALESCE($1, 0)
      ORDER BY follower_count DESC, post_count DESC
      LIMIT 20
    `;
    const suggestedResult = await db.query(suggestedQuery, [currentUserId]);
    return res.status(200).json({
      success: true,
      users: suggestedResult.rows.map((u) => ({
        ...u,
        is_following: Boolean(u.is_following)
      }))
    });
  }

  const query = `
    SELECT u.user_id, u.username, u.full_name, u.profile_image_url,
      EXISTS(
        SELECT 1 FROM follows
        WHERE follower_id = $2 AND following_id = u.user_id
      ) as is_following
    FROM users u
    WHERE u.username LIKE $1 OR u.full_name LIKE $1
    ORDER BY
      CASE WHEN u.username LIKE $1 THEN 0 ELSE 1 END,
      u.username ASC
    LIMIT 20
  `;

  const searchPattern = `%${queryParam}%`;
  const result = await db.query(query, [searchPattern, currentUserId]);

  res.status(200).json({
    success: true,
    users: result.rows.map((u) => ({
      ...u,
      is_following: Boolean(u.is_following)
    }))
  });
});

/**
 * Get user profile with stats and isFollowing status
 * GET /api/users/:id
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const targetParam = req.params.id;
  const isNumeric = /^\d+$/.test(targetParam);
  const currentUserId = req.user ? req.user.user_id : null;

  const query = isNumeric
    ? `
      SELECT u.user_id, u.username, u.email, u.full_name, u.bio, u.profile_image_url, u.created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.user_id) as post_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.user_id) as follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.user_id) as following_count,
        EXISTS(
          SELECT 1 FROM follows
          WHERE follower_id = $2 AND following_id = u.user_id
        ) as is_following
      FROM users u
      WHERE u.user_id = $1
    `
    : `
      SELECT u.user_id, u.username, u.email, u.full_name, u.bio, u.profile_image_url, u.created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.user_id) as post_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.user_id) as follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.user_id) as following_count,
        EXISTS(
          SELECT 1 FROM follows
          WHERE follower_id = $2 AND following_id = u.user_id
        ) as is_following
      FROM users u
      WHERE LOWER(u.username) = LOWER($1)
    `;

  const queryArg = isNumeric ? parseInt(targetParam, 10) : targetParam;
  const result = await db.query(query, [queryArg, currentUserId]);

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
  user.is_following = Boolean(user.is_following);

  res.status(200).json({
    success: true,
    user
  });
});

/**
 * Update authenticated user's own profile
 * PUT /api/users/me
 */
const updateProfile = asyncHandler(async (req, res) => {
  const currentUserId = req.user.user_id;
  const { full_name, bio, profile_image_url } = req.body;

  const updateQuery = `
    UPDATE users
    SET
      full_name = COALESCE($1, full_name),
      bio = COALESCE($2, bio),
      profile_image_url = COALESCE($3, profile_image_url)
    WHERE user_id = $4
  `;

  await db.query(updateQuery, [
    full_name !== undefined ? full_name : null,
    bio !== undefined ? bio : null,
    profile_image_url !== undefined ? profile_image_url : null,
    currentUserId
  ]);

  const fetchQuery = `
    SELECT user_id, username, email, full_name, bio, profile_image_url, created_at
    FROM users
    WHERE user_id = $1
  `;
  const result = await db.query(fetchQuery, [currentUserId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: result.rows[0]
  });
});

/**
 * Get list of followers for a user
 * GET /api/users/:id/followers
 */
const getUserFollowers = asyncHandler(async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUserId = req.user ? req.user.user_id : null;

  // Verify target user exists
  const userCheck = await db.query('SELECT user_id FROM users WHERE user_id = $1', [targetUserId]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  const query = `
    SELECT u.user_id, u.username, u.full_name, u.profile_image_url, f.created_at as followed_at,
      EXISTS(
        SELECT 1 FROM follows
        WHERE follower_id = $2 AND following_id = u.user_id
      ) as is_following
    FROM follows f
    INNER JOIN users u ON f.follower_id = u.user_id
    WHERE f.following_id = $1
    ORDER BY f.created_at DESC
  `;

  const result = await db.query(query, [targetUserId, currentUserId]);

  res.status(200).json({
    success: true,
    followers: result.rows
  });
});

/**
 * Get list of users that a user is following
 * GET /api/users/:id/following
 */
const getUserFollowing = asyncHandler(async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUserId = req.user ? req.user.user_id : null;

  // Verify target user exists
  const userCheck = await db.query('SELECT user_id FROM users WHERE user_id = $1', [targetUserId]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  const query = `
    SELECT u.user_id, u.username, u.full_name, u.profile_image_url, f.created_at as followed_at,
      EXISTS(
        SELECT 1 FROM follows
        WHERE follower_id = $2 AND following_id = u.user_id
      ) as is_following
    FROM follows f
    INNER JOIN users u ON f.following_id = u.user_id
    WHERE f.follower_id = $1
    ORDER BY f.created_at DESC
  `;

  const result = await db.query(query, [targetUserId, currentUserId]);

  res.status(200).json({
    success: true,
    following: result.rows
  });
});

module.exports = {
  searchUsers,
  getUserProfile,
  updateProfile,
  getUserFollowers,
  getUserFollowing
};
