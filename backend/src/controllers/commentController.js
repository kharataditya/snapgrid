const db = require('../config/db');
const { asyncHandler } = require('../utils/helpers');

/**
 * Get all comments for a post
 * GET /api/posts/:id/comments
 */
const getPostComments = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);

  // Check if post exists
  const postCheck = await db.query('SELECT post_id FROM posts WHERE post_id = $1', [postId]);
  if (postCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found.'
    });
  }

  const query = `
    SELECT c.comment_id, c.post_id, c.user_id, c.comment_text, c.created_at,
           u.username, u.profile_image_url
    FROM comments c
    INNER JOIN users u ON c.user_id = u.user_id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `;

  const result = await db.query(query, [postId]);

  res.status(200).json({
    success: true,
    comments: result.rows
  });
});

/**
 * Add a comment to a post
 * POST /api/posts/:id/comments
 */
const addComment = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const currentUserId = req.user.user_id;
  const { comment_text } = req.body;

  // Check if post exists
  const postCheck = await db.query('SELECT post_id FROM posts WHERE post_id = $1', [postId]);
  if (postCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found.'
    });
  }

  const insertQuery = `
    INSERT INTO comments (post_id, user_id, comment_text)
    VALUES ($1, $2, $3)
  `;

  const insertResult = await db.query(insertQuery, [
    postId,
    currentUserId,
    comment_text
  ]);

  const newCommentId = insertResult.insertId;

  const fetchQuery = `
    SELECT c.comment_id, c.post_id, c.user_id, c.comment_text, c.created_at,
           u.username, u.profile_image_url
    FROM comments c
    INNER JOIN users u ON c.user_id = u.user_id
    WHERE c.comment_id = $1
  `;

  const result = await db.query(fetchQuery, [newCommentId]);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully.',
    comment: result.rows[0]
  });
});

/**
 * Delete own comment
 * DELETE /api/comments/:id
 */
const deleteComment = asyncHandler(async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const currentUserId = req.user.user_id;

  // Verify comment exists and check ownership
  const findCommentQuery = 'SELECT comment_id, user_id FROM comments WHERE comment_id = $1';
  const commentResult = await db.query(findCommentQuery, [commentId]);

  if (commentResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found.'
    });
  }

  const comment = commentResult.rows[0];

  if (comment.user_id !== currentUserId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only delete your own comments.'
    });
  }

  await db.query('DELETE FROM comments WHERE comment_id = $1', [commentId]);

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully.'
  });
});

module.exports = {
  getPostComments,
  addComment,
  deleteComment
};
