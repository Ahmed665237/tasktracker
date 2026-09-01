"use strict";

module.exports = {
  async up(queryInterface) {
    /*
      Permanently removes rows that were
      previously soft deleted.

      This prevents old soft-deleted records
      from becoming visible again after
      deleted_at is removed.
    */
    await queryInterface.sequelize.query(
      `DELETE FROM tasks
       WHERE deleted_at IS NOT NULL;`
    );

    await queryInterface.sequelize.query(
      `DELETE FROM projects
       WHERE deleted_at IS NOT NULL;`
    );

    /*
      Removes soft-delete columns.
    */
    await queryInterface.removeColumn(
      "tasks",
      "deleted_at"
    );

    await queryInterface.removeColumn(
      "projects",
      "deleted_at"
    );
  },

  async down(queryInterface, Sequelize) {
    /*
      Restores the columns if this migration
      is rolled back.
    */
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
};