const db = require('../config/db');
const { asyncHandler } = require('../utils/helpers');

/**
 * Follow a user
 * POST /api/users/:id/follow
 */
const followUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user.user_id;
  let targetUserId = parseInt(req.params.id, 10);

  // If parameter is username instead of numeric ID, look up user_id
  if (isNaN(targetUserId)) {
    const userLookup = await db.query('SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)', [req.params.id]);
    if (userLookup.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found.'
      });
    }
    targetUserId = userLookup.rows[0].user_id;
  }

  // Check self-following
  if (currentUserId === targetUserId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself.'
    });
  }

  // Check if target user exists
  const userCheck = await db.query('SELECT user_id FROM users WHERE user_id = $1', [targetUserId]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User to follow not found.'
    });
  }

  // Insert follow relationship gracefully handling duplicates with INSERT IGNORE in MySQL
  const query = `
    INSERT IGNORE INTO follows (follower_id, following_id)
    VALUES ($1, $2)
  `;

  await db.query(query, [currentUserId, targetUserId]);

  res.status(200).json({
    success: true,
    message: 'Successfully followed user.',
    is_following: true,
    target_user_id: targetUserId
  });
});

/**
 * Unfollow a user
 * DELETE /api/users/:id/follow
 */
const unfollowUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user.user_id;
  let targetUserId = parseInt(req.params.id, 10);

  // If parameter is username instead of numeric ID, look up user_id
  if (isNaN(targetUserId)) {
    const userLookup = await db.query('SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)', [req.params.id]);
    if (userLookup.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    targetUserId = userLookup.rows[0].user_id;
  }

  // Check if target user exists
  const userCheck = await db.query('SELECT user_id FROM users WHERE user_id = $1', [targetUserId]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  const query = `
    DELETE FROM follows
    WHERE follower_id = $1 AND following_id = $2
  `;

  await db.query(query, [currentUserId, targetUserId]);

  res.status(200).json({
    success: true,
    message: 'Successfully unfollowed user.',
    is_following: false,
    target_user_id: targetUserId
  });
});

module.exports = {
  followUser,
  unfollowUser
};
