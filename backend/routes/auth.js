const express = require('express');
const router = express.Router();
const { signup, login, changePassword, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (require authentication)
router.post('/change-password', authenticateToken, changePassword);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;