'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Follower_Followed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Follower_Followed.init({
    followid: DataTypes.INTEGER,
    followedid: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Follower_Followed',
  });
  return Follower_Followed;
};