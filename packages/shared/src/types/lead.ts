export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type LeadSource =
  | "website"
  | "referral"
  | "social_media"
  | "cold_call"
  | "advertisement"
  | "walk_in"
  | "other";

export interface Lead {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  assigned_to?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  property_type_preference?: string;
  created_at: string;
  updated_at: string;
}
