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
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: "processing",
  },
  progress: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  output_path: {
    type: DataTypes.STRING,
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Jobs;
