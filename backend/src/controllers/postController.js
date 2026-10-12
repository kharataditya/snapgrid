const db = require('../config/db');
const { asyncHandler } = require('../utils/helpers');

/**
 * Get feed of posts from followed users and self
 * GET /api/posts/feed
 */
const getFeed = asyncHandler(async (req, res) => {
  const currentUserId = req.user.user_id;

  const query = `
    SELECT p.*, u.username, u.profile_image_url,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
      EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = $1) as is_liked,
      (SELECT GROUP_CONCAT(u2.username ORDER BY l2.created_at DESC SEPARATOR ', ')
       FROM likes l2
       JOIN users u2 ON l2.user_id = u2.user_id
       WHERE l2.post_id = p.post_id) as liked_by_usernames
    FROM posts p
    INNER JOIN users u ON p.user_id = u.user_id
    WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
       OR p.user_id = $1
    ORDER BY p.created_at DESC, p.post_id DESC
  `;

  const result = await db.query(query, [currentUserId]);

  // Ensure boolean is_liked, integer counts, and liked_by list
  const formattedPosts = result.rows.map((post) => ({
    ...post,
    is_liked: Boolean(post.is_liked),
    like_count: parseInt(post.like_count || 0, 10),
    comment_count: parseInt(post.comment_count || 0, 10),
    liked_by: post.liked_by_usernames ? post.liked_by_usernames.split(', ') : []
  }));

  res.status(200).json({
    success: true,
    posts: formattedPosts
  });
});

/**
 * Create a new post
 * POST /api/posts
 */
const createPost = asyncHandler(async (req, res) => {
  const currentUserId = req.user.user_id;
  const { image_url, caption } = req.body;

  const insertQuery = `
    INSERT INTO posts (user_id, image_url, caption)
    VALUES ($1, $2, $3)
  `;

  const insertResult = await db.query(insertQuery, [
    currentUserId,
    image_url,
    caption || null
  ]);

  const newPostId = insertResult.insertId;

  // Retrieve complete post details with author info
  const detailsQuery = `
    SELECT p.*, u.username, u.profile_image_url,
      0 as like_count,
      0 as comment_count,
      false as is_liked
    FROM posts p
    INNER JOIN users u ON p.user_id = u.user_id
    WHERE p.post_id = $1
  `;

  const detailsResult = await db.query(detailsQuery, [newPostId]);

  res.status(201).json({
    success: true,
    message: 'Post created successfully.',
    post: detailsResult.rows[0]
  });
});

/**
 * Get single post by ID with full details
 * GET /api/posts/:id
 */
const getPostById = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const currentUserId = req.user ? req.user.user_id : null;

  const query = `
    SELECT p.*, u.username, u.profile_image_url,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
      EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = $2) as is_liked,
      (SELECT GROUP_CONCAT(u2.username ORDER BY l2.created_at DESC SEPARATOR ', ')
       FROM likes l2
       JOIN users u2 ON l2.user_id = u2.user_id
       WHERE l2.post_id = p.post_id) as liked_by_usernames
    FROM posts p
    INNER JOIN users u ON p.user_id = u.user_id
    WHERE p.post_id = $1
  `;

  const result = await db.query(query, [postId, currentUserId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found.'
    });
  }

  const post = result.rows[0];
  post.is_liked = Boolean(post.is_liked);
  post.like_count = parseInt(post.like_count || 0, 10);
  post.comment_count = parseInt(post.comment_count || 0, 10);
  post.liked_by = post.liked_by_usernames ? post.liked_by_usernames.split(', ') : [];

  res.status(200).json({
    success: true,
    post
  });
});

/**
 * Delete a post (owner only)
 * DELETE /api/posts/:id
 */
const deletePost = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const currentUserId = req.user.user_id;

  // Check post existence and ownership
  const findPostQuery = 'SELECT post_id, user_id FROM posts WHERE post_id = $1';
  const postResult = await db.query(findPostQuery, [postId]);

  if (postResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found.'
    });
  }

  const post = postResult.rows[0];

  if (post.user_id !== currentUserId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to delete this post.'
    });
  }

  await db.query('DELETE FROM posts WHERE post_id = $1', [postId]);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully.'
  });
});

/**
 * Get all posts created by a specific user
 * GET /api/posts/user/:id
 */
const getUserPosts = asyncHandler(async (req, res) => {
  const targetParam = req.params.id;
  const isNumeric = /^\d+$/.test(targetParam);
  const currentUserId = req.user ? req.user.user_id : null;

  // Check if target user exists by id or username
  const userCheck = isNumeric
    ? await db.query('SELECT user_id FROM users WHERE user_id = $1', [parseInt(targetParam, 10)])
    : await db.query('SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)', [targetParam]);

  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  const targetUserId = userCheck.rows[0].user_id;

  const query = `
    SELECT p.*, u.username, u.profile_image_url,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
      EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = $2) as is_liked,
      (SELECT GROUP_CONCAT(u2.username ORDER BY l2.created_at DESC SEPARATOR ', ')
       FROM likes l2
       JOIN users u2 ON l2.user_id = u2.user_id
       WHERE l2.post_id = p.post_id) as liked_by_usernames
    FROM posts p
    INNER JOIN users u ON p.user_id = u.user_id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC, p.post_id DESC
  `;

  const result = await db.query(query, [targetUserId, currentUserId]);

  const formattedPosts = result.rows.map((post) => ({
    ...post,
    is_liked: Boolean(post.is_liked),
    like_count: parseInt(post.like_count || 0, 10),
    comment_count: parseInt(post.comment_count || 0, 10),
    liked_by: post.liked_by_usernames ? post.liked_by_usernames.split(', ') : []
  }));

  res.status(200).json({
    success: true,
    posts: formattedPosts
  });
});

/**
 * Like a post
 * POST /api/posts/:id/like
 */
const likePost = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const currentUserId = req.user.user_id;

  // Verify post exists
  const postCheck = await db.query('SELECT post_id FROM posts WHERE post_id = $1', [postId]);
  if (postCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found.'
    });
  }

  // Insert like, handling duplicate gracefully in MySQL
  const insertQuery = `
    INSERT IGNORE INTO likes (post_id, user_id)
    VALUES ($1, $2)
  `;
  await db.query(insertQuery, [postId, currentUserId]);

  // Retrieve current like count and updated likers
  const countResult = await db.query(
    `SELECT COUNT(*) as like_count,
       (SELECT GROUP_CONCAT(u2.username ORDER BY l2.created_at DESC SEPARATOR ', ')
        FROM likes l2 JOIN users u2 ON l2.user_id = u2.user_id WHERE l2.post_id = $1) as liked_by_usernames
     FROM likes WHERE post_id = $1`,
    [postId]
  );

  const likeCount = parseInt(countResult.rows[0]?.like_count || 0, 10);
  const likedByStr = countResult.rows[0]?.liked_by_usernames;
  const likedBy = likedByStr ? likedByStr.split(', ') : [];

  res.status(200).json({
    success: true,
    message: 'Post liked successfully.',
    is_liked: true,
    like_count: likeCount,
    liked_by: likedBy
  });
});

/**
 * Unlike a post
 * DELETE /api/posts/:id/like
 */
const unlikePost = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const currentUserId = req.user.user_id;

  // Verify post exists
  const postCheck = await db.query('SELECT post_id FROM posts WHERE post_id = $1', [postId]);
  if (postCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found.'
    });
  }

  // Delete like
  await db.query(
    'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
    [postId, currentUserId]
  );

  // Retrieve current like count and updated likers
  const countResult = await db.query(
    `SELECT COUNT(*) as like_count,
       (SELECT GROUP_CONCAT(u2.username ORDER BY l2.created_at DESC SEPARATOR ', ')
        FROM likes l2 JOIN users u2 ON l2.user_id = u2.user_id WHERE l2.post_id = $1) as liked_by_usernames
     FROM likes WHERE post_id = $1`,
    [postId]
  );

  const likeCount = parseInt(countResult.rows[0]?.like_count || 0, 10);
  const likedByStr = countResult.rows[0]?.liked_by_usernames;
  const likedBy = likedByStr ? likedByStr.split(', ') : [];

  res.status(200).json({
    success: true,
    message: 'Post unliked successfully.',
    is_liked: false,
    like_count: likeCount,
    liked_by: likedBy
  });
});

module.exports = {
  getFeed,
  createPost,
  getPostById,
  deletePost,
  getUserPosts,
  likePost,
  unlikePost
};
