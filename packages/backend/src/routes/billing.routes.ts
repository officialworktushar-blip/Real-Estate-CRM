import { Router, Request, Response, NextFunction } from "express";
import { auth, AuthRequest } from "../middleware/auth";
import { stripeService } from "../services/billing/stripe.service";
import { razorpayService } from "../services/billing/razorpay.service";
import { createAppError } from "../middleware/errorHandler";

const router = Router();

router.post(
  "/checkout",
  auth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { plan, provider } = req.body;
      if (!plan) {
        return next(createAppError("Plan is required", 400, "VALIDATION_ERROR"));
      }

      if (provider === "razorpay") {
        const result = await razorpayService.createSubscription(req.userId!, plan);
        res.json(result);
      } else {
        const result = await stripeService.createCheckoutSession(req.userId!, plan);
        res.json(result);
      }
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/portal",
  auth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await stripeService.createPortalSession(req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/verify",
  auth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(createAppError("Payment verification params required", 400, "VALIDATION_ERROR"));
      }
      const result = await razorpayService.verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
