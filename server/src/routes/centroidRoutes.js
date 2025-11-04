import { Router } from "express";
import {getVideos} from "./controllers/centroidController.js"

const centroidRouter = Router();

//GET /api/videos

//GET /thumbnail/{filename}

//POST /process/{filename}

//GET /process/{jobId}/status

centroidRouter.get('/api/videos', getVideos)