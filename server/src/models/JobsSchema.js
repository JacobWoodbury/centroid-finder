import sequelize from "../db/connection.js";
import { DataTypes } from "sequelize";

const Jobs = sequelize.define("jobs", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
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
