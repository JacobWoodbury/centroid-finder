import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jobsRouter from "./routes/jobsRoutes.js";
import videoRouter from "./routes/videosRoutes.js";
import logger from "./utils/logger.js"; // Import Winston logger

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Routes
app.use("/", jobsRouter);
app.use("/", videoRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error: %o", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
