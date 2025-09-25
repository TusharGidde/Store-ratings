const Rating = require("./Rating");
const Store = require("./Store");
const User = require("./User");
const { sequelize } = require("../config/dbconnection");

// User-Rating relationship
User.hasMany(Rating, {
  foreignKey: 'user_id',
  as: 'ratings',
});

Rating.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Store-Rating relationship
Store.hasMany(Rating, {
  foreignKey: 'store_id',
  as: 'ratings',
});

Rating.belongsTo(Store, {
  foreignKey: 'store_id',
  as: 'store',
});


User.hasMany(Store, {
  foreignKey: 'owner_id',
  as: 'ownedStores',
});

Store.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});



module.exports = {
  User,
  Store,
  Rating,
  sequelize 
};