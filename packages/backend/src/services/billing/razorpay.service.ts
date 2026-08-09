import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../../config";
import { supabaseAdmin } from "../../config/supabase";
import { createAppError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";

let razorpay: Razorpay | null = null;

function getClient(): Razorpay {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw createAppError("Razorpay not configured", 500, "RAZORPAY_NOT_CONFIGURED");
  }
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpay;
}

const PLAN_PRICES_INR: Record<string, number> = {
  starter: 241700,
  professional: 655700,
  enterprise: 1651700,
};

export const razorpayService = {
  async createSubscription(userId: string, plan: string) {
    const client = getClient();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (!profile) throw createAppError("User not found", 404, "USER_NOT_FOUND");

    const amount = PLAN_PRICES_INR[plan];
    if (!amount) throw createAppError("Invalid plan", 400, "INVALID_PLAN");

    const subscription = await client.subscriptions.create({
      plan_id: "", // Must create plans in Razorpay dashboard first
      customer_notify: 1,
      total_count: 12,
      notes: { user_id: userId, plan },
    });

    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status: "pending",
        razorpay_subscription_id: subscription.id,
      },
      { onConflict: "user_id" }
    );

    logger.info(`Razorpay subscription created for user ${userId}: ${plan}`);

    return {
      subscriptionId: subscription.id,
      short_url: subscription.short_url,
    };
  },

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw createAppError("Payment verification failed", 400, "PAYMENT_VERIFICATION_FAILED");
    }

    const client = getClient();
    const payment = await client.payments.fetch(razorpayPaymentId);

    const userId = (payment as any).notes?.user_id;
    if (userId) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "active" })
        .eq("user_id", userId);
    }

    return { verified: true };
  },

  async handleWebhook(body: Record<string, any>, signature: string) {
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.webhookSecret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (expectedSignature !== signature) {
      logger.error("Razorpay webhook signature verification failed");
      throw createAppError("Invalid webhook signature", 400, "INVALID_WEBHOOK");
    }

    const event = body.event;

    switch (event) {
      case "subscription.activated": {
        const subscription = body.payload?.subscription?.entity;
        if (subscription?.id) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active" })
            .eq("razorpay_subscription_id", subscription.id);
          logger.info(`Razorpay subscription activated: ${subscription.id}`);
        }
        break;
      }
      case "subscription.cancelled": {
        const subscription = body.payload?.subscription?.entity;
        if (subscription?.id) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("razorpay_subscription_id", subscription.id);
          logger.info(`Razorpay subscription cancelled: ${subscription.id}`);
        }
        break;
      }
      case "subscription.charged": {
        const subscription = body.payload?.subscription?.entity;
        if (subscription?.id) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active" })
            .eq("razorpay_subscription_id", subscription.id);
        }
        break;
      }
      default:
        logger.info(`Unhandled Razorpay event: ${event}`);
    }

    return { received: true };
  },
};
