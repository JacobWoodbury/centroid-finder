import { Router } from "express";
import { getVideos, getThumbnail } from "../controllers/videoController.js";

const centroidRouter = Router();

centroidRouter.get("/thumbnail/:fileName", getThumbnail);

centroidRouter.get("/api/videos", getVideos);

export default centroidRouter;
