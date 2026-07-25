import { Router } from "express";
import { auth } from "../middleware/auth";
import authRoutes from "./auth.routes";
import leadsRoutes from "./leads.routes";
import propertiesRoutes from "./properties.routes";
import clientsRoutes from "./clients.routes";
import dealsRoutes from "./deals.routes";
import calendarRoutes from "./calendar.routes";
import reportsRoutes from "./reports.routes";
import adminRoutes from "./admin";

const router = Router();

router.use("/auth", authRoutes);
router.use("/leads", auth, leadsRoutes);
router.use("/properties", auth, propertiesRoutes);
router.use("/clients", auth, clientsRoutes);
router.use("/deals", auth, dealsRoutes);
router.use("/calendar", auth, calendarRoutes);
router.use("/reports", auth, reportsRoutes);
router.use("/admin", auth, adminRoutes);

export default router;
