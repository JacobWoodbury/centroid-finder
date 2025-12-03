import { Router } from "express";
import { getStatus, startVideoProcess } from "../controllers/jobController.js";

const jobRouter = Router();

jobRouter.post("/process/:filename", startVideoProcess);

jobRouter.get("/process/:jobId/status", getStatus);

export default jobRouter;
