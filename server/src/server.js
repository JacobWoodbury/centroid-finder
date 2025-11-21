import express from "express";
import dotenv from "dotenv";

import colors from "colors";
import cors from "cors";
import jobsRouter from "./routes/jobsRoutes.js";
import videoRouter from "./routes/videosRoutes.js";

dotenv.config();

const { PORT } = process.env;
const app = express();

app.use(express());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", jobsRouter);
app.use("/", videoRouter);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`.bgYellow);
});
