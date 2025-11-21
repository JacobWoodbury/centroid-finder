import { Router } from "express";
import { getStatus, startVideoProcess } from "../controllers/jobController.js";

const jobRouter = Router();

jobRouter.post("/process/:fileName", startVideoProcess);

jobRouter.get("/process/:id/status", getStatus);

export default jobRouter;
