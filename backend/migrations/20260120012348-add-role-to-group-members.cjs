'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('group_members', 'role', {
      type: Sequelize.ENUM('admin', 'moderator', 'member'),
      defaultValue: 'member',
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('group_members', 'role');
  }
};
