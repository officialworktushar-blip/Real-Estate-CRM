export type UserRole = "user" | "super_admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  phone?: string;
  company?: string;
  license_number?: string;
  bio?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}
