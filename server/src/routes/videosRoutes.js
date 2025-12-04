import { Router } from "express";
import { getVideos, getThumbnail } from "../controllers/videoController.js";

const videoRouter = Router();

videoRouter.get("/thumbnail/:filename", getThumbnail);

videoRouter.get("/api/videos", getVideos);

export default videoRouter;
