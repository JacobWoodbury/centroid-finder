import sequelize from "../db/connection.js";
import { DataTypes } from "sequelize";

/**
 * Videos Model.
 *
 * Represents a video file in the database.
 * Fields:
 * - id: Primary key.
 * - filename: The name of the file on disk.
 * - filepath: The full directory path to the file.
 * - duration: Length of the video in seconds.
 * - uploaded_at: Timestamp of upload.
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
