import { DataTypes, Model } from "sequelize";
import sequelize from "../database.js";

class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false, // cant be empty
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // has to be unique
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
  },
  {
    sequelize,
    tableName: "users",

    // Sequelize automatically handles createdAt and updatedAt
    timestamps: true,

    // maps createdAt to created_at and updatedAt to updated_at
    underscored: true,
  }
);

export default User;