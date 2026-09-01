import {
  DataTypes,
  Model,
} from "sequelize";

import sequelize from "./database.js";

class TaskAudit extends Model {
  declare id: number;
  declare taskId: number;
  declare actorUserId: number;
  declare actionType: string;
  declare fieldName: string | null;
  declare oldValue: string | null;
  declare newValue: string | null;
  declare createdAt: Date;
}

TaskAudit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "task_id",
    },

    actorUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "actor_user_id",
    },

    actionType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "action_type",
    },

    fieldName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "field_name",
    },

    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "old_value",
    },

    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "new_value",
    },
  },
  {
    sequelize,
    tableName: "task_audits",
    timestamps: true,
    updatedAt: false, // hisotry should never be edited
    underscored: true,
  }
); // these are from the postgres table and their permissions and types

export default TaskAudit;