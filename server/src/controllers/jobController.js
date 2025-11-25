import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory job store
const jobStore = new Map();

export const startVideoProcess = (req, res) => {
  try {
    const { threshold, targetColor } = req.query;
    const { fileName } = req.params;
    const output = fileName + ".csv";

    if (!fileName || !targetColor || !threshold) {
      logger.warn("Missing required query parameters for file: %s", fileName);
      return res
        .status(400)
        .json({ error: "Missing targetColor or threshold query parameter." });
    }

    const jarPath = path.resolve(
      __dirname,
      "../../../processor/target/CentroidFinder-jar-with-dependencies.jar"
    );
    const inputPath = path.resolve("/videos", fileName);
    const outputPath = path.resolve("/results", output);

    // Create a new Job ID and store job in memory
    const jobId = randomUUID();
    const newJob = {
      id: jobId,
      filename: fileName,
      job_status: "processing",
      progress: 0,
      output_path: output,
      started_at: new Date(),
      completed_at: null,
      error: null,
    };
    jobStore.set(jobId, newJob);

    const jarArgs = [inputPath, outputPath, targetColor, threshold];

    logger.info(
      "Starting video process. Job ID: %s | Command: java -jar %s %o",
      jobId,
      jarPath,
      jarArgs
    );

    const child = spawn("java", ["-jar", jarPath, ...jarArgs], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let errorOutput = "";

    child.stdout.on("data", (data) => {
      logger.info("Job %s STDOUT: %s", jobId, data.toString().trim());
    });

    child.stderr.on("data", (data) => {
      const errorMsg = data.toString().trim();
      logger.error("Job %s STDERR: %s", jobId, errorMsg);
      errorOutput += errorMsg;
    });

    child.on("error", (err) => {
      logger.error("Failed to start background job %s: %o", jobId, err);
      const job = jobStore.get(jobId);
      if (job) {
        job.job_status = "error";
        job.completed_at = new Date();
        job.error = err.message || "Failed to start process";
        jobStore.set(jobId, job);
      }
    });

    child.on("exit", (code) => {
      const job = jobStore.get(jobId);
      if (job) {
        job.job_status = code === 0 ? "done" : "error";
        job.completed_at = new Date();
        if (code !== 0) {
          job.error = errorOutput || `Process failed with exit code ${code}`;
          logger.error("Job %s failed: %s", jobId, job.error);
        } else {
          logger.info("Job %s completed successfully.", jobId);
        }
        jobStore.set(jobId, job);
      } else {
        logger.warn("Job %s not found in store after exit.", jobId);
      }
    });

    child.unref();

    res.status(202).json({ jobId });
    logger.info("Background job started for %s (Job ID: %s)", fileName, jobId);
  } catch (error) {
    logger.error("Error starting video process: %o", error);
    res.status(500).json({ error: "Error starting job" });
  }
};

export const getStatus = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      logger.warn("Job ID not provided in status request");
      return res.status(400).json({ error: "Job ID not provided" });
    }

    const job = jobStore.get(id);
    if (!job) {
      logger.warn("Job ID %s not found in status request", id);
      return res.status(404).json({ error: "Job ID not found" });
    }

    if (job.job_status === "error") {
      logger.error("Status check for job %s reports error: %s", id, job.error);
      return res.status(200).json({
        status: job.job_status,
        error: job.error || "Error processing video: Unexpected ffmpeg error",
      });
    }

    res.status(200).json({
      status: job.job_status,
      result: job.job_status === "done" ? job.output_path : null,
    });
  } catch (error) {
    logger.error("Error fetching job status: %o", error);
    res.status(500).json({ error: "Error fetching job status" });
  }
};
