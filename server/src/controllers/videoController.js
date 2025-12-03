import { exec } from "child_process";
import path from "path";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";

const videoDir = "/videos";

export const getVideos = (req, res) => {
  try {
    fs.readdir(videoDir, (err, files) => {
      if (!err) {
        const videos = files.filter((file) => file.endsWith(".mp4"));

        const videoUrls = videos.map((file) => `/videos/${file}`);
        return res.json(videos);
      } else {
        return res.status(500).json({ error: "Error reading video directory" });
      }
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ error: "Error reading video directory" });
  }
};

export const getThumbnail = (req, res) => {
  //PATHS------------
  try {
    const { filename } = req.params;
    const videoPath = path.join(videoDir, filename);
    const thumbnailDir = path.join("public", "thumbnails");
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    const thumbnailPath = path.join(thumbnailDir, filename + ".jpeg");

    //using ffmpeg---------
    const command = `"${ffmpegPath}" -i ${videoPath} -ss 00:00:01 -vframes 1 -vf "scale=320:-1" -update 1 ${thumbnailPath} -y`;
    exec(command, (error) => {
      if (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Error generating thumbnail" });
      }
      const absolutePath = path.join(process.cwd(), thumbnailPath);

      if (absolutePath) {
        res.status(200).sendFile(absolutePath);
      } else {
        res.status(500).json({ error: "Error generating thumbnail" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error generating thumbnail" });
  }
};
