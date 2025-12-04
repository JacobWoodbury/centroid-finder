import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";
import db from "../models/index.js";

const { Jobs, Videos } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startVideoProcess = async (req, res) => {
  try {
    const { threshold, targetColor } = req.query;
    const { filename } = req.params;
    const output = filename + ".csv";

    if (!filename || !targetColor || !threshold) {
      logger.warn("Missing required query parameters for file: %s", filename);
      return res
        .status(400)
        .json({ error: "Missing targetColor or threshold query parameter." });
    }

    // Find or create the video in the database
    const [video] = await Videos.findOrCreate({
      where: { filename: filename },
      defaults: {
        filepath: `/videos/${filename}`,
        uploaded_at: new Date(),
      },
    });

    const jarPath = path.resolve(
      __dirname,
      "../../../processor/target/CentroidFinder-jar-with-dependencies.jar"
    );
    const inputPath = path.resolve("/videos", filename);
    const outputPath = path.resolve("/results", output);

    // Create a new Job in the database
    const newJob = await Jobs.create({
      input_video_id: video.id,
      job_status: "processing",
      progress: 0,
      output_path: output,
      started_at: new Date(),
    });

    const jobId = newJob.id;

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

    child.on("error", async (err) => {
      logger.error("Failed to start background job %s: %o", jobId, err);
      try {
        await newJob.update({
          job_status: "error",
          completed_at: new Date(),
        });
      } catch (dbErr) {
        logger.error("Failed to update job status to error for job %s: %o", jobId, dbErr);
      }
    });

    child.on("exit", async (code) => {
      try {
        const status = code === 0 ? "done" : "error";
        await newJob.update({
          job_status: status,
          completed_at: new Date(),
        });

        if (code !== 0) {
          logger.error("Job %s failed with exit code %s. Stderr: %s", jobId, code, errorOutput);
        } else {
          logger.info("Job %s completed successfully.", jobId);
        }
      } catch (dbErr) {
        logger.error("Failed to update job status on exit for job %s: %o", jobId, dbErr);
      }
    });

    child.unref();

    res.status(202).json({ jobId });
    logger.info("Background job started for %s (Job ID: %s)", filename, jobId);
  } catch (error) {
    logger.error("Error starting video process: %o", error);
    res.status(500).json({ error: "Error starting job" });
  }
};

export const getStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      logger.warn("Job ID not provided in status request");
      return res.status(400).json({ error: "Job ID not provided" });
    }

    const job = await Jobs.findByPk(jobId);
    if (!job) {
      logger.warn("Job ID %s not found in status request", jobId);
      return res.status(404).json({ error: "Job ID not found" });
    }

    if (job.job_status === "error") {
      logger.error("Status check for job %s reports error", jobId);
      return res.status(200).json({
        status: job.job_status,
        error: "Error processing video",
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
