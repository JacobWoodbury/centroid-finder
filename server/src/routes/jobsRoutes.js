import { Router } from "express";
import {
  getStatus,
  startVideoProcess,
  getCsv,
} from "../controllers/jobController.js";

const jobRouter = Router();

jobRouter.post("/process/:filename", startVideoProcess);

jobRouter.get("/process/:jobId/status", getStatus);

jobRouter.get("/results/:jobId", getCsv);

export default jobRouter;
