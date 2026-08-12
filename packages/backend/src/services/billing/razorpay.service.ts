import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../../config";
import { supabaseAdmin } from "../../config/supabase";
import { createAppError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";

export interface PlanDefinition {
  id: string;
  name: string;
  priceInr: number;
  currency: "INR";
  highlighted: boolean;
  features: string[];
}

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    priceInr: 2499,
    currency: "INR",
    highlighted: false,
    features: [
      "Up to 3 team members",
      "100 contacts & leads",
      "Property & deal tracking",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceInr: 5499,
    currency: "INR",
    highlighted: true,
    features: [
      "Up to 10 team members",
      "1,000 contacts & leads",
      "Advanced reports & pipeline",
      "Priority support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    priceInr: 14999,
    currency: "INR",
    highlighted: false,
    features: [
      "Unlimited team members",
      "Unlimited contacts & leads",
      "White-label & API access",
      "Dedicated account manager",
    ],
  },
];

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

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

function validatePlan(plan: string): PlanDefinition {
  const def = PLAN_CATALOG.find((p) => p.id === plan);
  if (!def) throw createAppError("Invalid plan", 400, "INVALID_PLAN");
  return def;
}

export const razorpayService = {
  getCatalog() {
    return PLAN_CATALOG;
  },

  async getSubscription(orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");
    return data;
  },

  /**
   * Creates a one-off Razorpay order for the plan and records it in the
   * payments ledger. The subscription itself is only changed once payment is
   * verified (verify endpoint or webhook), never at order creation.
   */
  async createOrder(orgId: string, userId: string, plan: string) {
    const client = getClient();
    const planDef = validatePlan(plan);
    const amount = planDef.priceInr * 100; // paise

    const order = await client.orders.create({
      amount,
      currency: "INR",
      receipt: `org_${orgId.replace(/-/g, "").slice(0, 8)}_${Date.now()}`,
      notes: { org_id: orgId, user_id: userId, plan },
    });

    const { error } = await supabaseAdmin.from("payments").insert({
      org_id: orgId,
      user_id: userId,
      plan,
      amount,
      currency: "INR",
      billing_provider: "razorpay",
      razorpay_order_id: order.id,
      status: "created",
    });

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    logger.info(`Razorpay order created for org ${orgId}: ${plan} (${amount} paise)`);

    return {
      orderId: order.id,
      amount,
      currency: "INR",
      // key_id is public; the key secret never leaves the server.
      keyId: config.razorpay.keyId,
    };
  },

  /**
   * Verifies the payment signature on the backend and, only if Razorpay
   * confirms the payment was captured, activates the subscription.
   */
  async verifyPayment(
    orgId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw createAppError("Payment verification failed", 400, "PAYMENT_VERIFICATION_FAILED");
    }

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpayOrderId)
      .eq("org_id", orgId)
      .maybeSingle();

    if (!payment) throw createAppError("Order not found", 404, "ORDER_NOT_FOUND");

    const client = getClient();
    const rpPayment = await client.payments.fetch(razorpayPaymentId);

    if (rpPayment.status !== "captured" && rpPayment.status !== "authorized") {
      throw createAppError("Payment not captured", 400, "PAYMENT_NOT_CAPTURED");
    }

    // Guard against tampering: the paid amount must match the order amount.
    if (Number(rpPayment.amount) !== Number(payment.amount)) {
      throw createAppError("Payment amount mismatch", 400, "PAYMENT_AMOUNT_MISMATCH");
    }

    await this.activateSubscription({
      orgId,
      plan: payment.plan,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      amountPaise: Number(rpPayment.amount),
    });

    return { verified: true, plan: payment.plan };
  },

  async activateSubscription(opts: {
    orgId: string;
    plan: string;
    orderId: string;
    paymentId: string;
    signature: string;
    amountPaise: number;
  }) {
    const now = new Date();
    const planDef = validatePlan(opts.plan);

    const { error: subError } = await supabaseAdmin.from("subscriptions").upsert(
      {
        org_id: opts.orgId,
        plan: opts.plan,
        status: "active",
        billing_provider: "razorpay",
        amount: planDef.priceInr,
        currency: "INR",
        current_period_start: now.toISOString(),
        current_period_end: new Date(now.getTime() + MONTH_MS).toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: "org_id" }
    );

    if (subError) throw createAppError(subError.message, 500, "DATABASE_ERROR");

    const { error: payError } = await supabaseAdmin
      .from("payments")
      .update({
        status: "succeeded",
        razorpay_payment_id: opts.paymentId,
        ...(opts.signature && { razorpay_signature: opts.signature }),
        paid_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("razorpay_order_id", opts.orderId);

    if (payError) throw createAppError(payError.message, 500, "DATABASE_ERROR");

    logger.info(`Subscription activated for org ${opts.orgId}: ${opts.plan}`);
  },

  /**
   * Handles Razorpay webhooks. The signature is computed over the raw request
   * body, so callers must pass the untouched body buffer.
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!config.razorpay.webhookSecret) {
      throw createAppError("Razorpay webhook secret not configured", 500, "WEBHOOK_NOT_CONFIGURED");
    }

    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      logger.error("Razorpay webhook signature verification failed");
      throw createAppError("Invalid webhook signature", 400, "INVALID_WEBHOOK");
    }

    const body = JSON.parse(rawBody.toString("utf8")) as Record<string, any>;
    const event = body.event;

    switch (event) {
      case "payment.captured":
      case "payment.authorized": {
        const entity = body.payload?.payment?.entity;
        if (entity?.order_id) {
          await this.activateFromWebhook(entity.order_id, entity.id, entity.amount);
        }
        break;
      }
      case "order.paid": {
        const entity = body.payload?.order?.entity;
        if (entity?.id) {
          await this.activateFromWebhook(entity.id, undefined, entity.amount);
        }
        break;
      }
      case "payment.failed": {
        const entity = body.payload?.payment?.entity;
        if (entity?.order_id) {
          await supabaseAdmin
            .from("payments")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("razorpay_order_id", entity.order_id);
          logger.info(`Razorpay payment failed for order ${entity.order_id}`);
        }
        break;
      }
      default:
        logger.info(`Unhandled Razorpay event: ${event}`);
    }

    return { received: true };
  },

  async activateFromWebhook(
    orderId: string,
    paymentId: string | undefined,
    amountPaise: number | string | undefined
  ) {
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (!payment?.org_id) {
      logger.warn(`Razorpay webhook: no local payment found for order ${orderId}`);
      return;
    }

    const paidAmount = Number(amountPaise) || 0;
    if (paidAmount && paidAmount !== Number(payment.amount)) {
      logger.warn(
        `Razorpay webhook: amount mismatch for order ${orderId} (expected ${payment.amount}, got ${paidAmount})`
      );
      return;
    }

    await this.activateSubscription({
      orgId: payment.org_id,
      plan: payment.plan,
      orderId,
      paymentId: paymentId || "",
      signature: "",
      amountPaise: paidAmount || payment.amount,
    });
  },
};
