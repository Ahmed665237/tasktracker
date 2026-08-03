"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("time_entries", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tasks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("time_entries");
  },
};
