const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconnection');
const Rating = require('./Rating');

// Store Model
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
      len: [20, 60],
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
    references: {
      model: User,
      key: 'id',
    },
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

// In models/Store.js
Store.updateAverageRating = async function(storeId) {
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
};

module.exports = Store;