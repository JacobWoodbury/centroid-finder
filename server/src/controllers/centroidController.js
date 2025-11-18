import { spawn, exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ffmpegPath from "ffmpeg-static";

import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const videoDir = "/videos"

/**
 * In-memory "database" to store job status.
 * This will be cleared if the server restarts.
 * * Map structure:
 * { 
 * "job-id-uuid" => { 
 * id: "job-id-uuid", 
 * filename: "video.mp4",
 * job_status: "processing" | "done" | "error",
 * output_path: "video.mp4.csv",
 * started_at: Date,
 * completed_at: Date | null,
 * error: string | null 
 * }
 * }
 */
const jobStore = new Map();

// --- No changes to getVideos ---
export const getVideos = (req, res) => {
  try {
    fs.readdir(videoDir, (err, files) => {
      if (!err) {
        const videos = files.filter((file) => file.endsWith(".mp4"));

        const videoUrls = videos.map((file) => `/videos/${file}`);
        return res.json(videoUrls);
      } else {
        return res.send(err);
      }
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- No changes to getThumbnail ---
export const getThumbnail = (req, res) => {
  //PATHS------------
  try {
    const { fileName } = req.params;
    const videoPath = path.join(videoDir, fileName);
    const thumbnailDir = path.join("public", "thumbnails");
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    const thumbnailPath = path.join(thumbnailDir, fileName + ".jpeg");

    //using ffmpeg---------
    const command = `"${ffmpegPath}" -i ${videoPath} -ss 00:00:01 -vframes 1 -vf "scale=320:-1" -update 1 ${thumbnailPath} -y`;
    exec(command, (error) => {
      if (error) {
        console.error(error.message);
        return res.status(500).send("Error generating thumbnail");
      }
      const absolutePath = path.join(process.cwd(), thumbnailPath);

      if (absolutePath) {
        res.status(200).sendFile(absolutePath);
      } else {
        res.status(500).send("Error generating thumbnail");
      }
    });
  } catch (error) {
    res.status(500).send("error generating thumbnail");
  }
};

// --- startVideoProcess (Database logic removed) ---
export const startVideoProcess = (req, res) => { // 'async' removed, not needed
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

    // --- Database logic replaced with in-memory map ---
    
    // 1. Create a new Job ID
    const jobId = randomUUID();

    // 2. Create a job object and store it
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

    // --- End of new in-memory logic ---

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
    child.on("exit", (code) => { // 'async' removed
      console.log(`Job ${jobId} exited with code ${code}`);
      
      // --- Database logic replaced with in-memory map update ---
      const job = jobStore.get(jobId);
      if (job) {
        job.job_status = (code == 0 ? "done" : "error");
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
      id: jobId, // Return the new UUID
    });

    console.log(`Background job started for ${fileName} (ID: ${jobId})`);
  } catch (error) {
    console.error("Error starting video process:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- getStatus (Database logic removed) ---
export const getStatus = (req, res) => { // 'async' removed
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "Job ID not provided" });
    }

    // --- Database logic replaced with in-memory map lookup ---
    const job = jobStore.get(id);
    // --- End of in-memory lookup ---

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