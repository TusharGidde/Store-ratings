const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconnection');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
      isInt: true,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ratings',
  indexes: [
    {
      fields: ['user_id', 'store_id'],
      unique: true, // One rating per user per store
    },
    {
      fields: ['store_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['rating'],
    },
  ],
});

// Add hooks for rating changes to update store average rating
Rating.addHook('afterCreate', async (rating) => {
  const Store = require('./Store');
  await Store.updateAverageRating(rating.store_id);
});

Rating.addHook('afterUpdate', async (rating) => {
  const Store = require('./Store');
  await Store.updateAverageRating(rating.store_id);
});

Rating.addHook('afterDestroy', async (rating) => {
  const Store = require('./Store');
  await Store.updateAverageRating(rating.store_id);
});

module.exports = Rating;