"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "projects",
      "deleted_at",
      {
        type: Sequelize.DATE,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      "tasks",
      "deleted_at",
      {
        type: Sequelize.DATE,
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "projects",
      "deleted_at"
    );

    await queryInterface.removeColumn(
      "tasks",
      "deleted_at"
    );
  },
};