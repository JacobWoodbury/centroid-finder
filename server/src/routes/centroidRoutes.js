import { Router } from "express";
import {
  getVideos,
  getStatus,
  getThumbnail,
  startVideoProcess,
} from "../controllers/centroidController.js";

const centroidRouter = Router();

//GET /api/videos

//GET /thumbnail/{filename}

//POST /process/{filename}

//GET /process/{jobId}/status

centroidRouter.get("/thumbnail/:filename", getThumbnail);

centroidRouter.get("/api/videos", getVideos);

centroidRouter.post("/process/:filename", startVideoProcess);

centroidRouter.get("/process/:id/status", getStatus);

export default centroidRouter;
