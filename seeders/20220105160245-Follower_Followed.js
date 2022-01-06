'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
     await queryInterface.bulkInsert('Follower_Followeds', [
        {id:1,
          createdAt:now,
          updatedAt:now,
          followid:2,
          followedid:4
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
