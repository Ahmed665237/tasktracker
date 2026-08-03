import { Sequelize } from "sequelize"; // imports from orm package
import dotenv from "dotenv";//dotenv lets Node read values from your .env file.

dotenv.config(); // this loads the env file into process 

const databaseName = process.env.DB_NAME;   // "tasktracker_db"
const databaseUser = process.env.DB_USER;   // "postgres"
const databasePassword = process.env.DB_PASSWORD;   // your PostgreSQL password
const databaseHost = process.env.DB_HOST;    // "172.26.16.1"
const databasePort = process.env.DB_PORT;   // "5432"
// these read the values from the database from connecction from the .env and given a java script variable name

if (
  !databaseName ||
  !databaseUser ||
  !databasePassword ||
  !databaseHost ||
  !databasePort
) {
  throw new Error("Database environment variables are missing");
}
// if any info is missing it throws an error instead of program crashing 
const sequelize = new Sequelize(
  databaseName,
  databaseUser,
  databasePassword,
  {
    host: databaseHost,
    port: Number(databasePort),
    dialect: "postgres",
    logging: false,
  }
  // this creates an object that connects backend to postgresSQL
);

export default sequelize;