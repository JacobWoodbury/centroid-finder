import sequelize from "../db/connection.js";
import { DataTypes } from "sequelize";

const Videos = sequelize.define("videos", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
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
