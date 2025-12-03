import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import Jobs from "../models/JobsSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startVideoProcess = async (req, res) => {
  try {
    const { targetColor, threshold } = req.query;
    const { filename } = req.params;
    const output = `/results/${filename}.csv`;
    
    if (!filename || !targetColor || !threshold) {
      return res.status(400).json({ 
        error: "Missing targetColor or threshold query parameter." 
      });
    }

    const jarPath = path.resolve(
      __dirname,
      "../../../processor/target/CentroidFinder-jar-with-dependencies.jar"
    );
    const inputPath = path.resolve("/videos", filename);
    const outputPath = path.resolve("/results", filename);

    // Create a new job in the database
    const newJob = await Jobs.create({
      filename: filename,
      job_status: "processing",
      progress: 0,
      output_path: output,
      started_at: new Date(),
      completed_at: null,
      error: null,
    });

    const jobId = newJob.id;

    const jarArgs = [inputPath, outputPath, targetColor, threshold];

    console.log("Executing:", ["java", "-jar", jarPath, ...jarArgs]);

    const child = spawn("java", ["-jar", jarPath, ...jarArgs], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let errorOutput = ""; // Store error messages from stderr
    child.stdout.on("data", (data) => {
      console.log(`Job ${jobId} STDOUT: ${data.toString()}`);
    });

    child.stderr.on("data", (data) => {
      const errorMsg = data.toString();
      console.error(`Job ${jobId} STDERR: ${errorMsg}`);
      errorOutput += errorMsg; // Collect error messages
    });

    child.on("error", async (err) => {
      console.error("Failed to start background job:", err);
      // Update job in database
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
      console.log(`Job ${jobId} exited with code ${code}`);

      // Update job in database
      const updateData = {
        job_status: code === 0 ? "done" : "error",
        completed_at: new Date(),
      };

      if (code !== 0) {
        updateData.error = errorOutput || "Process failed with non-zero exit code.";
      }

      await Jobs.update(updateData, { where: { id: jobId } });
      console.log(`Job ${jobId} status updated to ${updateData.job_status}`);
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
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(404).json({ error: "Job ID not found" });
    }
    
    const job = await Jobs.findByPk(jobId);
    
    if (!job) {
      return res.status(404).json({ error: "Job ID not found" });
    }
    
    if (job.job_status === "error") {
      return res.status(200).json({
        status: job.job_status,
        error: job.error || "Error processing video: Unexpected error",
      });
    }

    const response = {
      status: job.job_status,
    };

    // Only include result if job is done
    if (job.job_status === "done") {
      response.result = job.output_path;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching job status:", error);
    res.status(500).json({ error: "Error fetching job status" });
  }
};
