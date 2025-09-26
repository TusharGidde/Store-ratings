const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/dbconnection');

// Get All Stores (Public - for normal users and admins)
const getAllStores = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      address,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      minRating,
      maxRating
    } = req.query;

    // Build where conditions
    const whereConditions = { is_active: true };

    if (name) {
      whereConditions.name = { [Op.like]: `%${name}%` };
    }

    if (address) {
      whereConditions.address = { [Op.like]: `%${address}%` };
    }

    if (minRating) {
      whereConditions.average_rating = { [Op.gte]: parseFloat(minRating) };
    }

    if (maxRating) {
      if (whereConditions.average_rating) {
        whereConditions.average_rating = {
          ...whereConditions.average_rating,
          [Op.lte]: parseFloat(maxRating)
        };
      } else {
        whereConditions.average_rating = { [Op.lte]: parseFloat(maxRating) };
      }
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Valid sort fields
    const validSortFields = ['name', 'address', 'average_rating', 'total_ratings', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get stores with pagination
    const { count, rows: stores } = await Store.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        // Include user's rating if user is authenticated
        ...(req.user ? [{
          model: Rating,
          as: 'ratings',
          where: { user_id: req.user.id },
          required: false,
          attributes: ['id', 'rating', 'comment', 'created_at']
        }] : [])
      ],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Format response
    const formattedStores = stores.map(store => ({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      average_rating: parseFloat(store.average_rating) || 0,
      total_ratings: store.total_ratings,
      created_at: store.created_at,
      owner: store.owner,
      user_rating: req.user && store.ratings.length > 0 ? {
        rating: store.ratings[0].rating,
        comment: store.ratings[0].comment,
        rated_at: store.ratings[0].created_at
      } : null
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'Stores fetched successfully',
      data: {
        stores: formattedStores,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalStores: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores',
      error: error.message
    });
  }
};



// Create Store (Admin only)
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Validation
    if (!name || !email || !address || !owner_id) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if owner exists and is a store_owner
    const owner = await User.findOne({
      where: { id: owner_id, role: 'store_owner', is_active: true }
    });

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: 'Invalid owner ID or user is not a store owner'
      });
    }

    // Check if store with same email exists
    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'Store with this email already exists'
      });
    }

    // Check if owner already has a store
    const existingOwnerStore = await Store.findOne({ where: { owner_id } });
    if (existingOwnerStore) {
      return res.status(400).json({
        success: false,
        message: 'Owner already has a store'
      });
    }

    // Create store
    const newStore = await Store.create({
      name,
      email,
      address,
      owner_id
    });

    // Get store with owner details
    const storeWithOwner = await Store.findByPk(newStore.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: {
        store: storeWithOwner
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

    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating store',
      error: error.message
    });
  }
};

// Update Store (Admin or Store Owner)
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, is_active } = req.body;

    // Find store
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check permissions
    if (req.user.role === 'store_owner' && store.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own store'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    
    // Only admin can update is_active
    if (req.user.role === 'admin' && is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Check if email is being changed and if it already exists
    if (email && email !== store.email) {
      const existingStore = await Store.findOne({ where: { email } });
      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update store
    await store.update(updateData);

    // Get updated store with owner
    const updatedStore = await Store.findByPk(id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: {
        store: updatedStore
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

    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating store',
      error: error.message
    });
  }
};

// Get My Store (Store Owner only)
const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { owner_id: req.user.id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Rating,
          as: 'ratings',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    store.ratings.forEach(rating => {
      ratingDistribution[rating.rating]++;
    });

    const storeResponse = {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      average_rating: parseFloat(store.average_rating) || 0,
      total_ratings: store.total_ratings,
      is_active: store.is_active,
      created_at: store.created_at,
      updated_at: store.updated_at,
      rating_distribution: ratingDistribution,
      recent_ratings: store.ratings.slice(0, 10).map(rating => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        created_at: rating.created_at,
        user: rating.user
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Store details fetched successfully',
      data: {
        store: storeResponse
      }
    });

  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store details',
      error: error.message
    });
  }
};

// Delete Store (Admin only - soft delete)
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Soft delete - set is_active to false
    await store.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Store deactivated successfully'
    });

  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating store',
      error: error.message
    });
  }
};

module.exports = {
  getAllStores,
  createStore,
  updateStore,
  getMyStore,
  deleteStore,
};