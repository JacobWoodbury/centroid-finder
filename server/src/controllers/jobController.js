import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//For in memory
const jobStore = new Map();


export const startVideoProcess = (req, res) => {

  try {
    const { threshold, hexColor } = req.body;
    const { fileName } = req.params;
    const output = fileName + ".csv";
    if (!fileName || !hexColor || !threshold) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const jarPath = path.resolve(
      __dirname,
      "../../../processor/target/CentroidFinder-jar-with-dependencies.jar"
    );
    const inputPath = path.resolve("/videos", fileName);
    const outputPath = path.resolve("/results", output);

    
    //For in memory
    // Create a new Job ID
    const jobId = randomUUID();

    // Create a job object and store it
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

    // --- End of in-memory logic ---

    const jarArgs = [inputPath, outputPath, hexColor, threshold];

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

    child.on("error", (err) => {
      console.error("Failed to start background job:", err);
      // Update job in store
      const job = jobStore.get(jobId);
      if (job) {
        job.job_status = "error";
        job.completed_at = new Date();
        job.error = err.message || "Failed to start process";
        jobStore.set(jobId, job);
      }
    });

    // checks for the end of the process, if code is 0 it was successful.
    child.on("exit", (code) => {
      console.log(`Job ${jobId} exited with code ${code}`);

      // --- Database logic replaced with in-memory map update ---
      const job = jobStore.get(jobId);
      if (job) {
        job.job_status = code == 0 ? "done" : "error";
        job.completed_at = new Date();
        if (code != 0) {
          job.error = errorOutput || "Process failed with non-zero exit code.";
        }
        jobStore.set(jobId, job);
        console.log(`Job ${jobId} status updated to ${job.job_status}`);
      } else {
        console.error(`Job ${jobId} not found in store after exit.`);
      }
      // --- End of in-memory update ---
    });

    child.unref();

    res.status(202).json({
      message: "Job accepted and running in background.",
      id: jobId, 
    });

    console.log(`Background job started for ${fileName} (ID: ${jobId})`);
  } catch (error) {
    console.error("Error starting video process:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getStatus = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "Job ID not provided" });
    }
    const job = jobStore.get(id);
    if (!job) {
      return res.status(404).json({ message: "Job ID not found." });
    }
    if (job.job_status == "error") {
      return res.status(200).json({
        status: job.job_status,
        error: job.error || "Error processing video: Unexpected error",
      });
    }

    res.status(200).json({
      status: job.job_status,
      // Only show the result path if the job is actually done
      result: job.job_status === "done" ? job.output_path : null,
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    res.status(500).send("Error fetching job status");
  }
};
