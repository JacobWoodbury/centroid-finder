import Jobs from "./JobsSchema.js";
import Videos from "./VideosSchema.js";
import sequelize from "../db/connection.js";

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
