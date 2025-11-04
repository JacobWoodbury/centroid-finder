import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    if (!fileName || !output || !hexColor || !threshold) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const jarPath = path.resolve(
      __dirname,
      "../../../processor/target/CentroidFinder-jar-with-dependencies.jar"
    );
    const inputPath = path.resolve(__dirname, "../../public/videos", fileName);
    const outputPath = path.resolve(__dirname, "../../public/output", output);

    const jarArgs = [inputPath, outputPath, hexColor, threshold];

    console.log("Executing:", ["java", "-jar", jarPath, ...jarArgs]);

    const child = spawn("java", ["-jar", jarPath, ...jarArgs], {
      detached: true,
      stdio: "ignore",
    });

    child.on("error", (err) => {
      console.error("Failed to start background job:", err);
    });

    child.unref();

    res.status(202).json({
      message: "Job accepted and running in background.",
      pid: child.pid,
    });

    console.log(`Background job started for ${fileName} (PID: ${child.pid})`);
  } catch (error) {
    console.error("Error starting video process:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStatus = (req, res) => {};
