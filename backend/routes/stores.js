const express = require('express');
const router = express.Router();
const {
  getAllStores,
  createStore,
  updateStore,
  getMyStore,
  deleteStore,
} = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes (can be accessed by authenticated users)
router.get('/', authenticateToken, getAllStores); // All authenticated users can view stores

// Store owner routes
router.get('/my/store', authenticateToken, authorizeRoles('store_owner'), getMyStore);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'store_owner'), updateStore);

// Admin only routes
router.post('/', authenticateToken, authorizeRoles('admin', 'store_owner'), createStore);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteStore);

module.exports = router;