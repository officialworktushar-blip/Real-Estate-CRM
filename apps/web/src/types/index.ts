export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "user" | "owner" | "super_admin";
  org_id?: string;
  is_guest?: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role: string;
  org_id?: string | null;
  phone?: string | null;
  company?: string | null;
  license_number?: string | null;
  bio?: string | null;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface Lead {
  id: string;
  org_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  notes?: string;
  assigned_to?: string;
  budget?: number;
  created_at: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  org_id?: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  property_type: string;
  status: string;
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
  updated_at?: string;
}

export interface Client {
  id: string;
  org_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  type: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

export interface DealLeadRef {
  full_name: string;
  email?: string;
  phone?: string;
}

export interface DealPropertyRef {
  title: string;
  address?: string;
  price?: number;
}

export interface Deal {
  id: string;
  org_id?: string;
  title: string;
  property_id?: string;
  lead_id?: string;
  stage: string;
  value: number;
  expected_close_date?: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  leads?: DealLeadRef | null;
  properties?: DealPropertyRef | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
