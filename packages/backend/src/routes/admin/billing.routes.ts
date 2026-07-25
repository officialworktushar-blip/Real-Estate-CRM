import { Router } from "express";
import { adminBillingController } from "../../controllers/admin/billing.controller";

const router = Router();

router.get("/", adminBillingController.list);
router.get("/revenue", adminBillingController.revenue);

export default router;
