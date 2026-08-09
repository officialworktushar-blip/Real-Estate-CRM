export interface CalendarEvent {
  id: string;
  org_id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: "showing" | "meeting" | "inspection" | "closing" | "follow_up" | "other";
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  lead_id?: string;
  client_id?: string;
  property_id?: string;
  deal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  plan: "free" | "starter" | "professional" | "enterprise";
  status: "active" | "trialing" | "past_due" | "canceled";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  org_id?: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}
