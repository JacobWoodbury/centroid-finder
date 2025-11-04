import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export const getVideos = (req, res) => {
  try {
    const videoDir = path.join("public", "videos");
    fs.readdir(videoDir, (err, files) => {
      const videos = files.filter((file) => file.endsWith(".mp4"));

      const videoUrls = videos.map((file) => `/videos/${file}`);

      return res.json(videoUrls);
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getThumbnail = (req, res) => {
  const thumbnail = null; // some function to get thumbnail
  if (thumbnail) {
    res.status(200).json(thumbnail);
  } else {
    res.status(500).send("Error reading video directory");
  }
};

export const startVideoProcess = (req, res) => {
  try {
    const { threshold, output, hexColor } = req.body;
    const { fileName } = req.params;

    // Validate inputs
    if (!fileName || !output || !hexColor || !threshold) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Build absolute JAR path
    const jarPath = path.resolve(
      "../target/CentroidFinder-jar-with-dependencies.jar"
    );

    // Build argument list
    const jarArgs = [fileName, output, hexColor, threshold];

    // Spawn detached Java process
    const child = spawn("java", ["-jar", jarPath, ...jarArgs], {
      detached: true,
      stdio: "ignore", // don't tie to Express process
    });

    // Handle process errors
    child.on("error", (err) => {
      console.error("Failed to start background job:", err);
    });

    // Detach process from parent so Express can respond immediately
    child.unref();

    // Respond to client immediately (202 = Accepted, job running)
    res.status(202).json({
      message: "Job accepted and is running in the background.",
      pid: child.pid,
    });

    console.log(`Background job started for ${fileName} (PID: ${child.pid})`);
  } catch (error) {
    console.error("Error starting video process:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStatus = (req, res) => {};
