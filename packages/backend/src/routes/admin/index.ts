import { Router } from "express";
import { adminAuth } from "../../middleware/adminAuth";
import usersRoutes from "./users.routes";
import subscriptionsRoutes from "./subscriptions.routes";
import systemRoutes from "./system.routes";
import billingRoutes from "./billing.routes";

const router = Router();

router.use(adminAuth);
router.use("/users", usersRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/system", systemRoutes);
router.use("/billing", billingRoutes);

export default router;
