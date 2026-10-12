const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { authenticate } = require('../middleware/auth');
const { validateIdParam } = require('../middleware/validate');

// Follow / Unfollow user by user ID
router.post('/:id/follow', authenticate, validateIdParam('id'), followController.followUser);
router.delete('/:id/follow', authenticate, validateIdParam('id'), followController.unfollowUser);

// Direct follow / unfollow routes if mounted at /api/follows/:id
router.post('/:id', authenticate, validateIdParam('id'), followController.followUser);
router.delete('/:id', authenticate, validateIdParam('id'), followController.unfollowUser);

module.exports = router;
