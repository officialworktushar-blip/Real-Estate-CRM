import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("US"),
  pincode: z.string().min(1, "Pincode is required"),
  property_type: z.enum(["house", "apartment", "condo", "townhouse", "land", "commercial", "other"]),
  status: z.enum(["available", "pending", "sold", "rented", "off_market"]).default("available"),
  price: z.number().positive("Price must be positive"),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area_sqft: z.number().positive().optional(),
  features: z.array(z.string()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();
