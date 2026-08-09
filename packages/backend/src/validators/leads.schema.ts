import { z } from "zod";

export const createLeadSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z
    .enum(["new", "contacted", "qualified", "unqualified", "converted"])
    .default("new"),
  source: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  budget: z.number().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();
