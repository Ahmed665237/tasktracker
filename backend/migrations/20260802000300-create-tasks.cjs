"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "projects", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("To Do", "In Progress", "Done"),
        allowNull: false,
        defaultValue: "To Do",
      },
      priority: {
        type: Sequelize.ENUM("Low", "Medium", "High"),
        allowNull: false,
        defaultValue: "Medium",
      },
      estimated_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      due_date: {
        type: Sequelize.DATEONLY,
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
    await queryInterface.dropTable("tasks");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_priority";');
  },
};
