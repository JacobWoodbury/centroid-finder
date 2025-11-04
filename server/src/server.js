import express from "express";
import dotenv from "dotenv";
import db from "./models/index.js";
import colors from "colors";
import cors from "cors";
import centroidRouter from "./routes/centroidRoutes.js";
dotenv.config();
const { PORT } = process.env;

const app = express();
app.use(express());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
await db.sequelize.sync();

app.use("/", centroidRouter);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`.bgYellow);
});
