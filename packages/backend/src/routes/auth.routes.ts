import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema, forgotPasswordSchema } from "../validators";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/register", validate(registerSchema), authController.register);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/logout", authController.logout);

export default router;
