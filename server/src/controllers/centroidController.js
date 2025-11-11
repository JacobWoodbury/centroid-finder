import { spawn, exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ffmpegPath from "ffmpeg-static";
import db from "../models/index.js"


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
        return res.send(err);
      }
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getThumbnail = (req, res) => {
  //PATHS------------
  try{
    const {fileName} = req.params
    const videoPath = path.join(videoDir,fileName);
    const thumbnailDir = path.join("public", "thumbnails");
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    const thumbnailPath = path.join(thumbnailDir, fileName + ".jpeg");

    //using ffmpeg---------
    //ffmpegPath then use videoPath as input, jump to 1 second in the video get 1 frame, -vf formatting Width 320: height -match to aspect ratio
    const command = `"${ffmpegPath}" -i ${videoPath} -ss 00:00:01 -vframes 1 -vf "scale=320:-1" ${thumbnailPath} -y`;
    exec(command, (error)=>{
      if(error){
        console.error(error.message)
        return res.status(500).send("Error generating thumbnail");
      }
      const absolutePath = path.join(process.cwd(), thumbnailPath);
    
      if (absolutePath) {
        res.status(200).sendFile(absolutePath);
      } else {
        res.status(500).send("Error generating thumbnail");
      }
    })
  }catch(error){
    res.status(500).send("error generating thumbnail");
  }
};

export const startVideoProcess = async (req, res) => {
  try {
    const { threshold, hexColor } = req.body;
    const { fileName } = req.params;
    const output =  fileName +".csv";
    if (!fileName || !hexColor || !threshold) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
   //we might need to check if the output name already exists in our output folder. 
    const jarPath = path.resolve(
      __dirname,
      "../../../processor/target/CentroidFinder-jar-with-dependencies.jar"
    );
    const inputPath = path.resolve(__dirname, "../../public/videos", fileName);
    const outputPath = path.resolve(__dirname, "../../public/output", output);

    const [videoRecord, created] = await db.Videos.findOrCreate({
      where: { filename: fileName },
      defaults: {
        filename: fileName,
        filepath: inputPath,
      },
    });
    const jarArgs = [inputPath, outputPath, hexColor, threshold];

    console.log("Executing:", ["java", "-jar", jarPath, ...jarArgs]);

    const child = spawn("java", ["-jar", jarPath, ...jarArgs], {
      detached: true,
      stdio: "ignore",
    });

    child.on("error", (err) => {
      console.error("Failed to start background job:", err);
    });
    //checks for the end of the process, if code is 0 it was successful.
    child.on("exit", async (code)=>{
      const job = await db.Jobs.findOne({
        where: { job_id: child.pid },
      });
      job.job_status = (code == 0? "done": "error");
      job.completed_at = new Date();
      await job.save();
    });

    child.unref();

    res.status(202).json({
      message: "Job accepted and running in background.",
      pid: child.pid,
    });

    const newJob = await db.Jobs.create({
      job_id: child.pid,
      input_video_id: videoRecord.id,
      job_status: "processing",
      progress: 0,
      output_path: fileName+ ".csv",
      started_at: new Date(),
    });
    console.log(`Background job started for ${fileName} (PID: ${child.pid})`);
  } catch (error) {
    console.error("Error starting video process:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStatus = async (req, res) => {
  try{
    const {id} = req.params
    if (!id) {
      return res.status(404).json({ message: "Job ID not found" });
    }
    
     const job = await db.Jobs.findOne({
      where: { job_id: id },
      include: {
        model: db.Videos,
        attributes: ["filename"],
      },
    });
      if (!job) {
      return res.status(404).json({ message: "Job ID not found." });
    }
    if(job.job_status == "error"){
      res.status(200).json({
        status: job.job_status,
        error: "Error processing video: Unexpected ffmpeg error"
      })
    }
    res.status(200).json({
      status: job.job_status,
      result: `/output/${job.output_path}`,

    });
    
    
  }catch(error){
      res.status(500).send("Error fetching job status");
    }

};
