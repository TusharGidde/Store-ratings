const express = require('express');
const router = express.Router();
const {
  submitRating,
  getMyRatings,
  deleteRating,
  getStoreRatings,
  getAllRatings,
} = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Normal user and store owner routes
router.post('/', submitRating); // Submit or update rating
router.get('/my', getMyRatings); // Get user's own ratings
router.delete('/:id', deleteRating); // Delete user's own rating

// Store owner routes (can view ratings for their stores)
router.get('/store/:store_id', authorizeRoles('admin', 'store_owner'), getStoreRatings);

// Admin only routes
router.get('/', authorizeRoles('admin'), getAllRatings); // Get all ratings with filters

module.exports = router;