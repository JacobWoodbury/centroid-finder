import sequelize from "../db/connection.js";
import { DataTypes } from "sequelize";

/**
 * Sequelize model representing the 'videos' table.
 *
 * Stores metadata about uploaded video files including filename, path,
 * duration, and upload timestamp.
 */
const Videos = sequelize.define("videos", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.FLOAT,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    default: new Date(),
  },
});

export default Videos;
