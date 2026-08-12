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
