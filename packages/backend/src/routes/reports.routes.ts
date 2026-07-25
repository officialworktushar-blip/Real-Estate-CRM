import { Router } from "express";
import { reportsController } from "../controllers/reports.controller";

const router = Router();

router.get("/pipeline", reportsController.pipeline);
router.get("/performance", reportsController.performance);
router.get("/revenue", reportsController.revenue);

export default router;
