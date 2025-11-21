import sequelize from "../db/connection.js";
import { DataTypes } from "sequelize";

/**
 * Jobs Model.
 *
 * Represents a background processing task for a video.
 * Fields:
 * - id: Primary key.
 * - input_video_id: Foreign key linking to the Videos model.
 * - job_status: Current state (Pending, Processing, Done, Error).
 * - output_path: Path to the generated CSV file.
 * - started_at / completed_at: Execution timestamps.
 */
const Jobs = sequelize.define("jobs", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  input_video_id: {
    type: DataTypes.INTEGER,
  },
  job_status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    default: "Pending",
  },
  progress: {
    type: DataTypes.FLOAT,
    default: 0,
  },
  output_path: {
    type: DataTypes.STRING,
  },
  started_at: {
    type: DataTypes.DATE,
    default: new Date(),
  },
  completed_at: {
    type: DataTypes.DATE,
    default: null,
  },
});

export default Jobs;
