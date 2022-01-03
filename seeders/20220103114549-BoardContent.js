'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
     await queryInterface.bulkInsert('BoardContents', [
        {id:1,
          createdAt:now,
          updatedAt:now,
          text:'it was very fun',
          userid:1,
          boardid:1
        }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
