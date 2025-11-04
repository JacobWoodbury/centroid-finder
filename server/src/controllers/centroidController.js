import fs from "fs";
import path from "path";

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
  const { threshold, output, hexColor } = req.body;
  const { fileName } = req.params;
    const jarArgs = [fileName, output, hexColor, threshold]
  const jarPath = "target/CentroidFinder-jar-with-dependencies.jar";
  const child = spawn("java", ["-jar", jarPath, ...jarArgs], {
    detached: true,
    stdio: "ignore",
  });
  child.on("error", (err) => {
    // Note: We can't send a response here if one was already sent.
    // We can only log it to the server console.
    console.error("Failed to start background job:", err);
  });
  child.unref();
  res.status(202).send({
    message: "Job accepted and is running in the background.",
    pid: child.pid, // You can optionally return the PID
  });

  console.log(`Job started with PID: ${child.pid}. Response sent to client.`);
};

export const getStatus = (req, res) => {};
