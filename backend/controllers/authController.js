const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

// User Registration (Signup)
const signup = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Validation
    if (!name || !email || !password || !address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate role - only allow normal_user and store_owner for public signup
    const allowedRoles = ['normal_user', 'store_owner'];
    const userRole = role && allowedRoles.includes(role) ? role : 'normal_user';

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
      role: userRole
    });

    // Generate token
    const token = generateToken(newUser.id, newUser.role);

    // Remove password from response
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      address: newUser.address,
      role: newUser.role,
      created_at: newUser.created_at
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
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

    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// User Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Remove password from response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
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

    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userResponse = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      address: req.user.address,
      role: req.user.role,
      created_at: req.user.created_at,
      updated_at: req.user.updated_at
    };

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  changePassword,
  getProfile,
};