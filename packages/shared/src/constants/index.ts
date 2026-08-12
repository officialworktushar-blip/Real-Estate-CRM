export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
] as const;

export const LEAD_SOURCES = [
  "website",
  "referral",
  "social_media",
  "cold_call",
  "advertisement",
  "walk_in",
  "other",
] as const;

export const DEAL_STAGES = [
  "lead",
  "proposal",
  "negotiation",
  "contract",
  "closed_won",
  "closed_lost",
] as const;

export const PROPERTY_TYPES = [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "land",
  "commercial",
  "other",
] as const;

export const PROPERTY_STATUSES = [
  "available",
  "pending",
  "sold",
  "rented",
  "off_market",
] as const;

export const CLIENT_TYPES = [
  "buyer",
  "seller",
  "tenant",
  "landlord",
  "investor",
] as const;

export const SUBSCRIPTION_PLANS = ["free", "starter", "growth", "agency"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export interface PlanDefinition {
  id: Exclude<SubscriptionPlan, "free">;
  name: string;
  priceInr: number;
  currency: "INR";
  highlighted: boolean;
  features: string[];
}

export const BILLING_PLANS: PlanDefinition[] = [
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

export const EVENT_TYPES = [
  "showing",
  "meeting",
  "inspection",
  "closing",
  "follow_up",
  "other",
] as const;

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  DASHBOARD: {
    HOME: "/dashboard",
    LEADS: "/dashboard/leads",
    PROPERTIES: "/dashboard/properties",
    CLIENTS: "/dashboard/clients",
    DEALS: "/dashboard/deals",
    CALENDAR: "/dashboard/calendar",
    REPORTS: "/dashboard/reports",
    BILLING: "/dashboard/billing",
    SETTINGS: "/dashboard/settings",
  },
  ADMIN: {
    HOME: "/admin",
    USERS: "/admin/users",
    SUBSCRIPTIONS: "/admin/subscriptions",
    SETTINGS: "/admin/settings",
    AUDIT_LOGS: "/admin/audit-logs",
    BILLING: "/admin/billing",
  },
} as const;
