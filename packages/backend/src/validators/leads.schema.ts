import { z } from "zod";

export const createLeadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).default("new"),
  source: z.enum(["website", "referral", "social_media", "cold_call", "advertisement", "walk_in", "other"]),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  preferred_location: z.string().optional(),
  property_type_preference: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();
