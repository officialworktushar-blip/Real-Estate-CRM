import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  country: z.string().default("US"),
  property_type: z.enum(["house", "apartment", "condo", "townhouse", "land", "commercial", "other"]),
  status: z.enum(["available", "pending", "sold", "rented", "off_market"]).default("available"),
  price: z.number().positive("Price must be positive"),
  bedrooms: z.number().int().nonneg().optional(),
  bathrooms: z.number().nonneg().optional(),
  square_feet: z.number().positive().optional(),
  lot_size: z.number().positive().optional(),
  year_built: z.number().int().positive().optional(),
  mls_number: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();
