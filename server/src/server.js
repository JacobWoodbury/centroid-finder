import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jobsRouter from "./routes/jobsRoutes.js";
import videoRouter from "./routes/videosRoutes.js";

/**
 * Main entry point for the Express server.
 *
 * This file configures the application middleware (CORS, JSON parsing),
 * loads environment variables, and sets up the routing for the API.
 */
dotenv.config();

const { PORT } = process.env;
const app = express();

app.use(express());
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

app.use("/", jobsRouter);
app.use("/", videoRouter);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`.bgYellow);
});
