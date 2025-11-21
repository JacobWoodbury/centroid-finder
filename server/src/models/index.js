import Jobs from "./JobsSchema.js";
import Videos from "./VideosSchema.js";
import sequelize from "../db/connection.js";

/**
 * Database Model Associations.
 *
 * Defines the relationships between database tables:
 * - One Video has many Jobs (1:N).
 * - One Job belongs to one Video (1:1).
 */
Videos.hasMany(Jobs, {
  foreignKey: "input_video_id",
});
Jobs.belongsTo(Videos, {
  foreignKey: "input_video_id",
});

const db = {
  sequelize,
  Jobs,
  Videos,
};

export default db;
