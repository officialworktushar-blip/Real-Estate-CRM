import { api } from "./api";

export interface Plan {
  id: string;
  name: string;
  priceInr: number;
  currency: "INR";
  highlighted: boolean;
  features: string[];
}

export interface Subscription {
  id: string;
  org_id: string;
  plan: string;
  status: string;
  billing_provider?: string;
  amount?: number;
  currency?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyResult {
  verified: boolean;
  plan: string;
}

/**
 * Static plan catalog shown on the Plans & Billing page. Serves as the default
 * source of truth so the page always renders even if the backend is down; the
 * backend catalog (`GET /billing/plans`) is fetched on top and, when available,
 * overrides these values.
 */
export const BILLING_PLANS: Plan[] = [
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

export const billingService = {
  plans() {
    return api.get<{ data: Plan[] }>("/billing/plans");
  },

  subscription() {
    return api.get<{ data: Subscription | null }>("/billing/subscription");
  },

  checkout(plan: string) {
    return api.post<CheckoutOrder>("/billing/checkout", { plan });
  },

  verify(orderId: string, paymentId: string, signature: string) {
    return api.post<VerifyResult>("/billing/verify", {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });
  },
};
