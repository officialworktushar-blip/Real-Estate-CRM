export type ClientType = "buyer" | "seller" | "tenant" | "landlord" | "investor";

export interface Client {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  client_type: ClientType;
  notes?: string;
  referred_by?: string;
  total_transactions: number;
  lifetime_value: number;
  created_at: string;
  updated_at: string;
}
