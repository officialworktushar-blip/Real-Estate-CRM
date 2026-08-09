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

export const SUBSCRIPTION_PLANS = ["free", "starter", "professional", "enterprise"] as const;

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
