import { spawn, exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ffmpegPath from 'ffmpeg-static';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const videoDir = path.join("public", "videos");

export const getVideos = (req, res) => {
  try {
    
    fs.readdir(videoDir, (err, files) => {
      if(!err){
        const videos = files.filter((file) => file.endsWith(".mp4"));

        const videoUrls = videos.map((file) => `/videos/${file}`);
        return res.json(videoUrls);
      }else{
        return res.send(err)
      }

      
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getThumbnail = (req, res) => {
  //PATHS------------
  const {fileName} = req.params
  const videoPath = path.join(videoDir,fileName)
  const thumbnailDir = path.join('public', 'thumbnails');
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}
const thumbnailPath = path.join(thumbnailDir, fileName + ".jpeg");


  //using ffmpeg---------
  //ffmpegPath then use videoPath as input, jump to 1 second in the video get 1 frame, -vf formatting Width 320: height -match to aspect ratio
  const command = `"${ffmpegPath}" -i ${videoPath} -ss 00:00:01 -vframes 1 -vf "scale=320:-1" ${thumbnailPath}`;
  exec(command, (error)=>{
    if(error){
      console.error(error.message)
      return;
    }
     const absolutePath = path.join(process.cwd(), thumbnailPath);

  if (absolutePath) {
    res.status(200).sendFile(absolutePath);
  } else {
    res.status(500).send("Error generating thumbnail");
  }
  })

  //grabbing the image to send ------
 
  
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
