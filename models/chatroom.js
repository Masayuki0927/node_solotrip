'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chatroom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chatroom.hasMany(models.Chatroomuser);
      Chatroom.hasMany(models.Chatmessage);
    }
  };
  Chatroom.init({
    tmp: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Chatroom',
  });
  return Chatroom;
};