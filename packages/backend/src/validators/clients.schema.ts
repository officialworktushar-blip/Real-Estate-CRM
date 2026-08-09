import { z } from "zod";

export const createClientSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z
    .enum(["buyer", "seller", "tenant", "landlord", "investor"])
    .default("buyer"),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

export const updateClientSchema = createClientSchema.partial();
