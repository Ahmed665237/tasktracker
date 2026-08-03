"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("task_audit_records", {
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
      actor_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      action_type: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      old_value: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      new_value: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("task_audit_records");
  },
};
