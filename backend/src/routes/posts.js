const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  validateCreatePost,
  validateCreateComment,
  validateIdParam
} = require('../middleware/validate');

// Feed (must be before :id)
router.get('/feed', authenticate, postController.getFeed);

// Create post
router.post('/', authenticate, validateCreatePost, postController.createPost);

// Posts by specific user (supports user_id or username; must be before :id)
router.get('/user/:id', optionalAuth, postController.getUserPosts);

// Single post operations
router.get('/:id', optionalAuth, validateIdParam('id'), postController.getPostById);
router.delete('/:id', authenticate, validateIdParam('id'), postController.deletePost);

// Likes
router.post('/:id/like', authenticate, validateIdParam('id'), postController.likePost);
router.delete('/:id/like', authenticate, validateIdParam('id'), postController.unlikePost);

// Comments for post
router.get('/:id/comments', validateIdParam('id'), commentController.getPostComments);
router.post(
  '/:id/comments',
  authenticate,
  validateIdParam('id'),
  validateCreateComment,
  commentController.addComment
);

module.exports = router;
