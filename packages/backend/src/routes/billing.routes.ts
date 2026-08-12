import { Router, Response, NextFunction } from "express";
import { auth, AuthRequest } from "../middleware/auth";
import { razorpayService } from "../services/billing/razorpay.service";
import { createAppError } from "../middleware/errorHandler";

const router = Router();

router.get("/plans", auth, (_req: AuthRequest, res: Response) => {
  res.json({ data: razorpayService.getCatalog() });
});

router.get("/subscription", auth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.organizationId) {
      return next(createAppError("No organization linked to account", 400, "NO_ORG"));
    }
    const subscription = await razorpayService.getSubscription(req.organizationId);
    res.json({ data: subscription });
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", auth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { plan } = req.body;
    if (!plan) {
      return next(createAppError("Plan is required", 400, "VALIDATION_ERROR"));
    }
    if (!req.organizationId) {
      return next(createAppError("No organization linked to account", 400, "NO_ORG"));
    }
    const result = await razorpayService.createOrder(req.organizationId, req.userId!, plan);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/verify", auth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(createAppError("Payment verification params required", 400, "VALIDATION_ERROR"));
    }
    if (!req.organizationId) {
      return next(createAppError("No organization linked to account", 400, "NO_ORG"));
    }
    const result = await razorpayService.verifyPayment(
      req.organizationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
