import { api } from "./api";
import type { PaginatedResponse } from "@/types";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at?: string;
  organization?: { name: string };
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_provider?: string;
  amount?: number;
  currency?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export interface SubscriptionStats {
  total: number;
  active: number;
  cancelled: number;
  past_due: number;
  trialing: number;
  mrr: number;
  arr: number;
}

export interface SystemStats {
  total_users: number;
  total_organizations: number;
  total_leads: number;
  total_properties: number;
  total_deals: number;
  active_subscriptions: number;
  storage_used?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export interface BillingRecord {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  billing_provider: string;
  invoice_id?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export interface RevenueData {
  month: string;
  stripe: number;
  razorpay: number;
  total: number;
}

export const adminService = {
  users: {
    async list(params?: { page?: number; limit?: number; search?: string }) {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.search) searchParams.set("search", params.search);
      return api.get<PaginatedResponse<AdminUser>>(`/admin/users?${searchParams}`);
    },

    async updateRole(id: string, role: string) {
      return api.put<{ data: AdminUser; message: string }>(`/admin/users/${id}/role`, { role });
    },

    async deactivate(id: string) {
      return api.delete<{ message: string }>(`/admin/users/${id}`);
    },
  },

  subscriptions: {
    async list(params?: { page?: number; limit?: number }) {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      return api.get<PaginatedResponse<AdminSubscription>>(`/admin/subscriptions?${searchParams}`);
    },

    async update(id: string, data: { status?: string }) {
      return api.put<{ data: AdminSubscription; message: string }>(`/admin/subscriptions/${id}`, data);
    },

    async stats() {
      return api.get<{ data: SubscriptionStats }>("/admin/subscriptions/stats");
    },
  },

  system: {
    async health() {
      return api.get<{ data: Record<string, unknown> }>("/admin/system/health");
    },

    async stats() {
      return api.get<{ data: SystemStats }>("/admin/system/stats");
    },

    async auditLogs(params?: { page?: number; limit?: number }) {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      return api.get<PaginatedResponse<AuditLog>>(`/admin/system/audit-logs?${searchParams}`);
    },
  },

  billing: {
    async list(params?: { page?: number; limit?: number }) {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      return api.get<PaginatedResponse<BillingRecord>>(`/admin/billing?${searchParams}`);
    },

    async revenue(params?: { start?: string; end?: string }) {
      const searchParams = new URLSearchParams();
      if (params?.start) searchParams.set("start", params.start);
      if (params?.end) searchParams.set("end", params.end);
      const qs = searchParams.toString();
      return api.get<{ data: RevenueData[] }>(`/admin/billing/revenue${qs ? `?${qs}` : ""}`);
    },
  },
};
