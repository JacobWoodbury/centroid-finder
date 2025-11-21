import { Router } from "express";
import { getStatus, startVideoProcess } from "../controllers/jobController.js";

const centroidRouter = Router();

centroidRouter.post("/process/:fileName", startVideoProcess);

centroidRouter.get("/process/:id/status", getStatus);

export default centroidRouter;
