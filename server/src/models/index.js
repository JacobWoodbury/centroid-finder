import Jobs from "./JobsSchema";
import Videos from "./VideosSchema";
import sequelize from "../../db/connection";

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
