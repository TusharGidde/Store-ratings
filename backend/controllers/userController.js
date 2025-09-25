const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/dbconnection');

// Admin Dashboard - Get Statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.count({
      where: { role: { [Op.ne]: 'admin' } } // Exclude admin users from count
    });
    
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    
    // Get role-wise user count
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });


    // Get top rated stores
    const topStores = await Store.findAll({
      attributes: ['id', 'name', 'average_rating', 'total_ratings'],
      order: [['average_rating', 'DESC']],
      limit: 5
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics fetched successfully',
      data: {
        statistics: {
          totalUsers,
          totalStores,
          totalRatings,
          usersByRole
        },
        topStores
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Admin Create User
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Validation
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate role
    const allowedRoles = ['admin', 'normal_user', 'store_owner'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      address,
      role
    });

    // If user is store_owner, create a store record automatically
    let store = null;
    if (role === "store_owner") {
      store = await Store.create({
        name: name,
        email: email,
        address: address,
        owner_id: newUser.id
      });
    }

    // Remove password from response
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      address: newUser.address,
      role: newUser.role,
      is_active: newUser.is_active,
      created_at: newUser.created_at,
      ...(store && { store: { id: store.id, name: store.name } })
    };

    res.status(201).json({
      success: true,
      message: `${role.replace('_', ' ')} created successfully`,
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Get All Users with Filters and Pagination
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      email,
      address,
      role,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Build where conditions
    const whereConditions = {};

    if (name) {
      whereConditions.name = { [Op.like]: `%${name}%` };
    }

    if (email) {
      whereConditions.email = { [Op.like]: `%${email}%` };
    }

    if (address) {
      whereConditions.address = { [Op.like]: `%${address}%` };
    }

    if (role) {
      whereConditions.role = role;
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Valid sort fields
    const validSortFields = ['name', 'email', 'role', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password'] },
      include: [{
        model: Store,
        as: 'ownedStores',
        attributes: ['id', 'name', 'average_rating', 'total_ratings'],
        required: false
      }],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get Single User Details
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'ownedStores',
          attributes: ['id', 'name', 'email', 'address', 'average_rating', 'total_ratings']
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'rating', 'comment', 'created_at'],
          include: [{
            model: Store,
            as: 'store',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// Update User (Admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    await user.update(updateData);

    // Get updated user without password
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete User (Soft delete by setting is_active to false)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - set is_active to false
    await user.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};