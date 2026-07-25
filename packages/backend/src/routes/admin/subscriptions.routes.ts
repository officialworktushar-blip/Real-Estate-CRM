import { Router } from "express";
import { adminSubscriptionsController } from "../../controllers/admin/subscriptions.controller";

const router = Router();

router.get("/", adminSubscriptionsController.list);
router.put("/:id", adminSubscriptionsController.update);
router.get("/stats", adminSubscriptionsController.stats);

export default router;
