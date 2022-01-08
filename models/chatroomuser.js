'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chatroomuser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chatroomuser.belongsTo(models.Chatroom);
      Chatroomuser.belongsTo(models.User);
    }
  };
  Chatroomuser.init({
    chatroomid: DataTypes.INTEGER,
    userid: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chatroomuser',
  });
  return Chatroomuser;
};