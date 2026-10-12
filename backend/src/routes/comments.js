const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const { validateIdParam } = require('../middleware/validate');

// Delete comment by comment ID
router.delete('/:id', authenticate, validateIdParam('id'), commentController.deleteComment);

module.exports = router;
