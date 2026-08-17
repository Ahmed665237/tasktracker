"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "task_audits",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        task_id: {
          type: Sequelize.INTEGER,
          allowNull: false,

          references: {
            model: "tasks",
            key: "id",
          },

          onUpdate: "CASCADE", // when sth happens  to the parent row it applies to the child row
          onDelete: "CASCADE",
        },

        actor_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,

          references: {
            model: "users",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        action_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        field_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        old_value: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        new_value: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          ),
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "task_audits"
    );
  },
};