import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();

/**
 * Database Connection Configuration.
 *
 * Establishes a connection to SQLite database using Sequelize.
 */
const { DB_PATH } = process.env;

console.log(process.env);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH || '/app/data/database.sqlite',
  logging: (q) => console.log(`Sequelize Query: ${q}`),
});

try {
  await sequelize.authenticate();
  console.log("Connected to SQLite DB".bgGreen);
} catch (error) {
  console.log("Can not connect to db. Error: ".bgRed, error);
}

export default sequelize;
