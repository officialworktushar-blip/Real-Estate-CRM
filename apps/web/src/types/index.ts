export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "user" | "super_admin";
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
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
  source: string;
  notes?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  status: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  images?: string[];
  created_at: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  client_type: string;
  total_transactions: number;
  lifetime_value: number;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number;
  expected_close_date?: string;
  clients?: { first_name: string; last_name: string };
  created_at: string;
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
