const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// User CRUD operations
router.post('/', createUser);
router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;


