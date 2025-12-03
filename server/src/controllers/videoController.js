import { exec } from "child_process";
import path from "path";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";
import logger from "../utils/logger.js";

const videoDir = "/videos";

export const getVideos = (req, res) => {
  try {
    fs.readdir(videoDir, (err, files) => {
      if (!err) {
        const videos = files.filter((file) => file.endsWith(".mp4"));

        const videoUrls = videos.map((file) => `/videos/${file}`);
        return res.json(videos);
      } else {
        logger.error("Error reading video directory: %o", err);
        return res.status(500).json({ error: "Error reading video directory" });
      }

      const videos = files.filter((file) => file.endsWith(".mp4"));
      const videoUrls = videos.map((file) => `/videos/${file}`);
      logger.info("Fetched %d videos from directory", videos.length);
      return res.json(videoUrls);
    });
  } catch (error) {
    logger.error("Unexpected error fetching videos: %o", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getThumbnail = (req, res) => {
  try {
    const { fileName } = req.params;
    if (!fileName) {
      logger.warn("Thumbnail request missing fileName parameter");
      return res.status(400).json({ error: "File name not provided" });
    }

    const videoPath = path.join(videoDir, fileName);
    const thumbnailDir = path.join("public", "thumbnails");

    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
      logger.info("Created thumbnail directory at %s", thumbnailDir);
    }

    const thumbnailPath = path.join(thumbnailDir, fileName + ".jpeg");

    const command = `"${ffmpegPath}" -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf "scale=320:-1" -update 1 "${thumbnailPath}" -y`;

    exec(command, (error) => {
      if (error) {
        logger.error(
          "FFmpeg error generating thumbnail for %s: %o",
          fileName,
          error
        );
        return res.status(500).json({ error: "Error generating thumbnail" });
      }

      const absolutePath = path.join(process.cwd(), thumbnailPath);
      logger.info("Thumbnail generated for %s at %s", fileName, absolutePath);

      if (fs.existsSync(absolutePath)) {
        res.status(200).sendFile(absolutePath);
      } else {
        logger.error(
          "Thumbnail file not found after generation for %s",
          fileName
        );
        res.status(500).json({ error: "Error generating thumbnail" });
      }
    });
  } catch (error) {
    logger.error(
      "Unexpected error generating thumbnail for %s: %o",
      req.params.fileName,
      error
    );
    res.status(500).json({ error: "Error generating thumbnail" });
  }
};
