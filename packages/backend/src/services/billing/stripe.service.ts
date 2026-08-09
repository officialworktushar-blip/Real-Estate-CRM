import Stripe from "stripe";
import { config } from "../../config";
import { supabaseAdmin } from "../../config/supabase";
import { createAppError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";

let stripe: Stripe | null = null;

function getClient(): Stripe {
  if (!config.stripe.secretKey) {
    throw createAppError("Stripe not configured", 500, "STRIPE_NOT_CONFIGURED");
  }
  if (!stripe) {
    stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
  }
  return stripe;
}

function getPriceId(plan: string): string {
  const map: Record<string, string> = {
    starter: config.stripe.priceStarter,
    professional: config.stripe.priceProfessional,
    enterprise: config.stripe.priceEnterprise,
  };
  if (!map[plan]) throw createAppError("Invalid plan", 400, "INVALID_PLAN");
  if (!map[plan]) throw createAppError("Stripe price not configured for plan", 500, "STRIPE_NOT_CONFIGURED");
  return map[plan];
}

export const stripeService = {
  async createCheckoutSession(userId: string, plan: string) {
    const client = getClient();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile) throw createAppError("User not found", 404, "USER_NOT_FOUND");

    let customerId = profile.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await client.customers.create({
        email: profile.email,
        name: profile.full_name || undefined,
        metadata: { user_id: userId },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    const session = await client.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: getPriceId(plan), quantity: 1 }],
      success_url: `${config.frontend.url}/dashboard?checkout=success`,
      cancel_url: `${config.frontend.url}/dashboard?checkout=cancelled`,
      metadata: { user_id: userId, plan },
    });

    return { sessionId: session.id, url: session.url };
  },

  async createPortalSession(userId: string) {
    const client = getClient();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      throw createAppError("No billing account found", 404, "NO_BILLING_ACCOUNT");
    }

    const session = await client.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${config.frontend.url}/dashboard`,
    });

    return { url: session.url };
  },

  async handleWebhook(payload: Buffer, signature: string) {
    const client = getClient();

    let event: Stripe.Event;
    try {
      event = client.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err) {
      logger.error("Stripe webhook signature verification failed:", (err as Error).message);
      throw createAppError("Invalid webhook signature", 400, "INVALID_WEBHOOK");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan,
              status: "active",
              stripe_subscription_id: session.subscription as string,
            },
            { onConflict: "user_id" }
          );
          logger.info(`Stripe subscription activated for user ${userId}: ${plan}`);
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (profile) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active", current_period_end: new Date(invoice.period_end * 1000).toISOString() })
            .eq("user_id", profile.id);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (profile) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", profile.id);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);
        logger.info(`Stripe subscription cancelled: ${subscription.id}`);
        break;
      }
      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  },
};
