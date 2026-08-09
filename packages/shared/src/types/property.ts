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
  state: string;
  zip_code: string;
  country: string;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
  mls_number?: string;
  images?: string[];
  features?: string[];
  listed_by?: string;
  created_at: string;
  updated_at: string;
}
