const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const followController = require('../controllers/followController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateUpdateProfile, validateIdParam } = require('../middleware/validate');

// User search
router.get('/search', optionalAuth, userController.searchUsers);

// Current user profile update
router.put('/me', authenticate, validateUpdateProfile, userController.updateProfile);

// Specific user profile (supports user_id or username)
router.get('/:id', optionalAuth, userController.getUserProfile);

// Followers & Following lists
router.get('/:id/followers', optionalAuth, userController.getUserFollowers);
router.get('/:id/following', optionalAuth, userController.getUserFollowing);

// Follow / Unfollow actions
router.post('/:id/follow', authenticate, followController.followUser);
router.delete('/:id/follow', authenticate, followController.unfollowUser);

module.exports = router;
