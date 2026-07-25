import { Router } from "express";
import { adminSystemController } from "../../controllers/admin/system.controller";

const router = Router();

router.get("/health", adminSystemController.health);
router.get("/stats", adminSystemController.stats);
router.get("/audit-logs", adminSystemController.auditLogs);

export default router;
