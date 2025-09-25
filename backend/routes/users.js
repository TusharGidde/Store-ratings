const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User CRUD operations
router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;


