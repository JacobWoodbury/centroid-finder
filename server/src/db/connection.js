import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import colors from "colors";
import path from "path";

dotenv.config();

/**
 * Database Connection Configuration.
 *
 * Establishes a connection to the SQLite database.
 * Database file is stored in /app/data/database.sqlite
 */

// Use SQLite for simpler configuration
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_PATH || "/app/data/database.sqlite",
  logging: (q) => console.log(`Sequelize Query: ${q}`),
});

try {
  await sequelize.authenticate();
  console.log("Connected to SQLite DB".bgGreen);
} catch (error) {
  console.log("Can not connect to db. Error: ".bgRed, error);
}

export default sequelize;
