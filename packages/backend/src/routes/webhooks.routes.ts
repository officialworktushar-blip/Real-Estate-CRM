import { Router, Request, Response, NextFunction } from "express";
import { stripeService } from "../services/billing/stripe.service";
import { razorpayService } from "../services/billing/razorpay.service";
import { logger } from "../utils/logger";

const router = Router();

router.post("/stripe", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    const result = await stripeService.handleWebhook(
      req.body as Buffer,
      signature
    );
    res.json(result);
  } catch (err) {
    logger.error("Stripe webhook error:", (err as Error).message);
    next(err);
  }
});

router.post("/razorpay", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      res.status(400).json({ error: "Missing x-razorpay-signature header" });
      return;
    }

    const result = await razorpayService.handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    logger.error("Razorpay webhook error:", (err as Error).message);
    next(err);
  }
});

router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Webhook endpoint active" });
});

export default router;
