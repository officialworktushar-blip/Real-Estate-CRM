export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted";

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
  org_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  assigned_to?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
}
