'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BoardContent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BoardContent.belongsTo(models.Board);
      BoardContent.belongsTo(models.User);
    }
  };
  BoardContent.init({
    text: DataTypes.STRING,
    userid: DataTypes.STRING,
    boardid: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BoardContent',
  });
  return BoardContent;
};