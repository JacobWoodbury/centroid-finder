import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import Jobs from "../models/JobsSchema.js";
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
    const output = `/results/${filename}.csv`;

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
    const inputPath = path.resolve("/videos", filename);
    const outputPath = path.resolve("/results", filename);

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
    });

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
  
  await Jobs.update(
    {
      job_status: "error",
      completed_at: new Date(),
      error: err.message || "Failed to start process",
    },
    { where: { id: jobId } }
  );
  
});

// checks for the end of the process, if code is 0 it was successful.
child.on("exit", async (code) => {
  // Log the exit code
  logger.info(`Job ${jobId} exited with code ${code}`); // Using logger from 'main'

  // Prepare update data for the database
  const updateData = {
    job_status: code === 0 ? "done" : "error",
    completed_at: new Date(),
  };

  if (code !== 0) {
    // Add error message if the exit code is not 0
    updateData.error = errorOutput || `Process failed with exit code ${code}`;
    logger.error("Job %s failed: %s", jobId, updateData.error); // Log error for failed jobs
  } else {
    logger.info("Job %s completed successfully.", jobId); // Log success
  }

  // Update job in database
  await Jobs.update(updateData, { where: { id: jobId } });
  logger.info(`Job ${jobId} status updated to ${updateData.job_status}`);
  

});

    child.unref();

    res.status(202).json({
      jobId: jobId,
    });

    console.log(`Background job started for ${filename} (ID: ${jobId})`);
  } catch (error) {
    console.error("Error starting video process:", error);
    res.status(500).json({ error: "Error starting job" });
  }
};

export const getStatus = async (req, res) => {
  try {
    const { jobId } = req.params; // Use jobId for consistency

    if (!jobId) {
      // Use logger and correct 400 status code from 'main'
      logger.warn("Job ID not provided in status request"); 
      return res.status(400).json({ error: "Job ID not provided" });
    }

    // Use asynchronous database lookup from 'processor-testing'
    const job = await Jobs.findByPk(jobId);

    if (!job) {
      // Use logger from 'main'
      logger.warn("Job ID %s not found in status request", jobId); 
      return res.status(404).json({ error: "Job ID not found" });
    }

    if (job.job_status === "error") {
      // Use logger from 'main' to log the error
      logger.error("Status check for job %s reports error: %s", jobId, job.error); 
    }
    
    // Add logic to return the job status (this was missing from the conflict snippet)
    return res.status(200).json(job);

  } catch (error) {
    logger.error("Error retrieving job status for %s: %o", req.params.jobId || 'unknown', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
      return res.status(200).json({
        status: job.job_status,
        error: job.error || "Error processing video: Unexpected ffmpeg error",
      });
    }

    const response = {
      status: job.job_status,
      result: job.job_status === "done" ? job.output_path : null,
    });
  } catch (error) {
    
    res.status(500).json({ error: "Error fetching job status" });
  }
};
