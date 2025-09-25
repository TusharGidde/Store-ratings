const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');

// Submit or Update Rating
const submitRating = async (req, res) => {
  try {
    const { store_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!store_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Store ID and rating are required'
      });
    }

    // Validate rating value
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Check if store exists and is active
    const store = await Store.findOne({
      where: { id: store_id, is_active: true }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found or inactive'
      });
    }

    // Check if user is trying to rate their own store
    if (req.user.role === 'store_owner' && store.owner_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rate your own store'
      });
    }

    // Check if user already rated this store
    const existingRating = await Rating.findOne({
      where: { user_id, store_id }
    });

    let ratingRecord;
    let isUpdate = false;

    if (existingRating) {
      // Update existing rating
      await existingRating.update({
        rating,
        comment: comment || null
      });
      ratingRecord = existingRating;
      isUpdate = true;
    } else {
      // Create new rating
      ratingRecord = await Rating.create({
        user_id,
        store_id,
        rating,
        comment: comment || null
      });
    }

    // Get rating with user and store details
    const ratingWithDetails = await Rating.findByPk(ratingRecord.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'average_rating', 'total_ratings']
        }
      ]
    });

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Rating updated successfully' : 'Rating submitted successfully',
      data: {
        rating: ratingWithDetails
      }
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
};

// Get User's Ratings
const getMyRatings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Valid sort fields
    const validSortFields = ['rating', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'address', 'average_rating', 'total_ratings'],
        where: { is_active: true }
      }],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'Your ratings fetched successfully',
      data: {
        ratings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRatings: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your ratings',
      error: error.message
    });
  }
};

// Get Single Rating
const getRatingById = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'address', 'average_rating', 'total_ratings']
        }
      ]
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user can view this rating
    // Users can view their own ratings, store owners can view ratings for their stores, admins can view all
    const canView = req.user.role === 'admin' || 
                   rating.user_id === req.user.id || 
                   (req.user.role === 'store_owner' && rating.store.owner_id === req.user.id);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rating details fetched successfully',
      data: {
        rating
      }
    });

  } catch (error) {
    console.error('Get rating by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rating details',
      error: error.message
    });
  }
};

// Delete Rating (User can delete their own rating)
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findByPk(id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user can delete this rating (only their own ratings or admin)
    if (req.user.role !== 'admin' && rating.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own ratings'
      });
    }

    await rating.destroy();

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });

  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting rating',
      error: error.message
    });
  }
};

// Get Store Ratings (for store owners and admins)
const getStoreRatings = async (req, res) => {
  try {
    const { store_id } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      rating_filter
    } = req.query;

    // Check if store exists
    const store = await Store.findByPk(store_id);
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
        message: 'You can only view ratings for your own store'
      });
    }

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = { store_id };

    if (rating_filter) {
      whereConditions.rating = parseInt(rating_filter);
    }

    // Valid sort fields
    const validSortFields = ['rating', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate rating statistics
    const allStoreRatings = await Rating.findAll({
      where: { store_id },
      attributes: ['rating']
    });

    const ratingStats = {
      total: allStoreRatings.length,
      average: store.average_rating,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    allStoreRatings.forEach(rating => {
      ratingStats.distribution[rating.rating]++;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'Store ratings fetched successfully',
      data: {
        store: {
          id: store.id,
          name: store.name,
          average_rating: store.average_rating,
          total_ratings: store.total_ratings
        },
        rating_statistics: ratingStats,
        ratings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRatings: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store ratings',
      error: error.message
    });
  }
};

// Get User's Rating for Specific Store
const getUserStoreRating = async (req, res) => {
  try {
    const { store_id } = req.params;
    const user_id = req.user.id;

    // Check if store exists
    const store = await Store.findOne({
      where: { id: store_id, is_active: true }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Find user's rating for this store
    const rating = await Rating.findOne({
      where: { user_id, store_id },
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'average_rating', 'total_ratings']
      }]
    });

    res.status(200).json({
      success: true,
      message: rating ? 'User rating found' : 'No rating found',
      data: {
        rating: rating || null,
        can_rate: !rating || req.user.role !== 'store_owner' || store.owner_id !== req.user.id
      }
    });

  } catch (error) {
    console.error('Get user store rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user rating',
      error: error.message
    });
  }
};

// Get All Ratings (Admin only)
const getAllRatings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      rating_filter,
      user_id,
      store_id
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (rating_filter) {
      whereConditions.rating = parseInt(rating_filter);
    }

    if (user_id) {
      whereConditions.user_id = parseInt(user_id);
    }

    if (store_id) {
      whereConditions.store_id = parseInt(store_id);
    }

    // Valid sort fields
    const validSortFields = ['rating', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'average_rating', 'total_ratings']
        }
      ],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'All ratings fetched successfully',
      data: {
        ratings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRatings: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all ratings',
      error: error.message
    });
  }
};

module.exports = {
  submitRating,
  getMyRatings,
  getRatingById,
  deleteRating,
  getStoreRatings,
  getUserStoreRating,
  getAllRatings,
};