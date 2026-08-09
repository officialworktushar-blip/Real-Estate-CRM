export type ClientType = "buyer" | "seller" | "tenant" | "landlord" | "investor";

export interface Client {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone?: string;
  type: ClientType;
  notes?: string;
  created_at: string;
  updated_at: string;
}
