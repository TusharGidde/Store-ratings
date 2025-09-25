const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes =  require('./users');
const storeRoutes = require('./stores');
const ratingRoutes = require('./ratings');

// Use routes
router.use('/auth', authRoutes);
router.use('/users',userRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);


// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;