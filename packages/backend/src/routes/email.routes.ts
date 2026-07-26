import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { auth, AuthRequest } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import { emailService } from "../services/email.service";
import { logger } from "../utils/logger";

const router = Router();

const testEmailSchema = z.object({
  email: z.string().email("Valid email address is required"),
});

router.post(
  "/test",
  auth,
  adminAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = testEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({
          error: "Validation failed",
          details: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
        return;
      }

      const { email } = parsed.data;
      logger.info(`Test email requested by user ${req.userId} to: ${email}`);

      const result = await emailService.sendTest(email);

      if (result.success) {
        res.json({
          message: "Test email sent successfully",
          id: result.id,
          to: email,
        });
      } else {
        res.status(500).json({
          error: "Failed to send test email",
          details: result.error,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

export default router;
