'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class followedtest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  followedtest.init({
    text: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'followedtest',
  });
  return followedtest;
};