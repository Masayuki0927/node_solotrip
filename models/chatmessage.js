'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chatmessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chatmessage.belongsTo(models.Chatroom);
      Chatmessage.belongsTo(models.User);
    }
  };
  Chatmessage.init({
    chatroomid: DataTypes.INTEGER,
    userid: DataTypes.INTEGER,
    text: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Chatmessage',
  });
  return Chatmessage;
};