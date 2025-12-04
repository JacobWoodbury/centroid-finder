import { exec } from "child_process";
import path from "path";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";
import logger from "../utils/logger.js";
import db from "../models/index.js";

const { Videos } = db;
const videoDir = "/videos";

export const getVideos = (req, res) => {
  try {
    fs.readdir(videoDir, async (err, files) => {
      if (err) {
        logger.error("Error reading video directory: %o", err);
        return res.status(500).json({ error: "Error reading video directory" });
      }

      const videoFiles = files.filter((file) => file.endsWith(".mp4"));

      // Sync with database
      for (const file of videoFiles) {
        await Videos.findOrCreate({
          where: { filename: file },
          defaults: {
            filepath: `/videos/${file}`,
            uploaded_at: new Date(),
          },
        });
      }

      // Return just filenames, not full URLs
      logger.info("Fetched %d videos from directory and synced with DB", videoFiles.length);
      return res.json(videoFiles);
    });
  } catch (error) {
    logger.error("Unexpected error fetching videos: %o", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getThumbnail = (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename) {
      logger.warn("Thumbnail request missing filename parameter");
      return res.status(400).json({ error: "File name not provided" });
    }

    const videoPath = path.join(videoDir, filename);
    const thumbnailDir = path.join("public", "thumbnails");

    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
      logger.info("Created thumbnail directory at %s", thumbnailDir);
    }

    const thumbnailPath = path.join(thumbnailDir, filename + ".jpeg");

    const command = `"${ffmpegPath}" -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf "scale=320:-1" -update 1 "${thumbnailPath}" -y`;

    exec(command, (error) => {
      if (error) {
        logger.error(
          "FFmpeg error generating thumbnail for %s: %o",
          filename,
          error
        );
        return res.status(500).json({ error: "Error generating thumbnail" });
      }

      const absolutePath = path.join(process.cwd(), thumbnailPath);
      logger.info("Thumbnail generated for %s at %s", filename, absolutePath);

      if (fs.existsSync(absolutePath)) {
        res.status(200).sendFile(absolutePath);
      } else {
        logger.error(
          "Thumbnail file not found after generation for %s",
          filename
        );
        res.status(500).json({ error: "Error generating thumbnail" });
      }
    });
  } catch (error) {
    logger.error(
      "Unexpected error generating thumbnail for %s: %o",
      req.params.filename,
      error
    );
    res.status(500).json({ error: "Error generating thumbnail" });
  }
};
