import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/logout", authController.logout);
router.post("/ensure-org", auth, authController.ensureOrg);

export default router;
