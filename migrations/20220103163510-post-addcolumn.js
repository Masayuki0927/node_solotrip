'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn('posts', 'good', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }),
      queryInterface.addColumn('posts', 'userid', {
        type: Sequelize.INTEGER
      })
    ];
  },

  down: async (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('posts', 'good'),
      queryInterface.removeColumn('posts', 'userid')
    ];
  }
};
