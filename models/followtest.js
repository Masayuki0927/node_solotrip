'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class followtest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      followtest.belongsToMany(models.followedtest, {through: "Follower_Followeds"});
    }
  };
  followtest.init({
    text: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'followtest',
  });
  return followtest;
};