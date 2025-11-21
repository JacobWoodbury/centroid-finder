import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();

/**
 * Database Connection Configuration.
 *
 * Establishes a connection to the MySQL database using Sequelize.
 * Credentials are read from environment variables.
 */
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_DIALECT } =
  process.env;
console.log(process.env);

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  port: DB_PORT,
  logging: (q) => console.log(`Sequelize Query: ${q}`),
});

try {
  await sequelize.authenticate();
  console.log("Connected to MySQL DB".bgGreen);
} catch (error) {
  console.log("Can not connect to db. Error: ".bgRed, error);
}

export default sequelize;
