export type PropertyStatus =
  | "available"
  | "pending"
  | "sold"
  | "rented"
  | "off_market";

export type PropertyType =
  | "house"
  | "apartment"
  | "condo"
  | "townhouse"
  | "land"
  | "commercial"
  | "other";

export interface Property {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  pincode?: string;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  images?: string[];
  features?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}
