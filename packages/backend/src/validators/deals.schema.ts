import { z } from "zod";

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  property_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  stage: z
    .enum(["lead", "proposal", "negotiation", "contract", "closed_won", "closed_lost"])
    .default("lead"),
  value: z.number().min(0, "Value cannot be negative").default(0),
  expected_close_date: z.string().optional(),
  actual_close_date: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

export const updateDealSchema = createDealSchema.partial();
