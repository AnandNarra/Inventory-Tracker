const express = require('express');
const router = express.Router();
const { authUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Wrap async handlers
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/login', asyncHandler(authUser));
router.get('/me', protect, asyncHandler(getUserProfile));

module.exports = router;
