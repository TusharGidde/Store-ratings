const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconnection');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [5, 60],
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 400],
      notEmpty: true,
    },
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5,
    },
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'stores',
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['email'],
      unique: true,
    },
    {
      fields: ['owner_id'],
    },
    {
      fields: ['average_rating'],
    },
  ],
});

// Static method to update store's average rating
Store.updateAverageRating = async function(storeId) {
  try {
    const Rating = require('./Rating');
    
    const ratings = await Rating.findAll({
      where: { store_id: storeId },
      attributes: ['rating'],
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    await this.update(
      {
        average_rating: parseFloat(averageRating.toFixed(2)),
        total_ratings: totalRatings,
      },
      { where: { id: storeId } }
    );

    return {
      average_rating: parseFloat(averageRating.toFixed(2)),
      total_ratings: totalRatings,
    };
  } catch (error) {
    console.error('Error updating store rating:', error);
    throw error;
  }
};

module.exports = Store;