import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import centroidRouter from "./routes/centroidRoutes.js";

/**
 * Main entry point for the Express server.
 *
 * This file configures the application middleware (CORS, JSON parsing),
 * loads environment variables, and sets up the routing for the API.
 */
dotenv.config();

const { PORT } = process.env;
const app = express();

// Middleware Configuration
app.use(express());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route Configuration
app.use("/", centroidRouter);

// Start the Server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`.bgYellow);
});
