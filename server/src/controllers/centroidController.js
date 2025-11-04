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

export const startVideoProcess = (req, res) => {};

export const getStatus = (req, res) => {};
