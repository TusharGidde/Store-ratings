const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconnection');

// Rating Model
const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Store,
      key: 'id',
    },
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
      unique: true, 
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

// Add hooks for rating changes
Rating.addHook('afterCreate', async (rating) => {
  const Store = require('./Store');
  await Store.updateAverageRating(rating.store_id);
});

Rating.addHook('afterUpdate', async (rating) => {
  await updateStoreRating(rating.store_id);
});

Rating.addHook('afterDestroy', async (rating) => {
  await updateStoreRating(rating.store_id);
});

module.exports = Rating;