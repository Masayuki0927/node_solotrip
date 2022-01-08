'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.BoardContent);
      User.hasMany(models.Post);
      User.hasMany(models.Chatroomuser);
      User.hasMany(models.Chatmessage);
      User.belongsToMany(models.User, {
        as: "follower", 
        foreignKey: "followid", 
        through: models.Follower_Followed
      });
      User.belongsToMany(models.User, {
        as: "followed", 
        foreignKey: "followedid", 
        through: models.Follower_Followed
      });
    }
  };
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};