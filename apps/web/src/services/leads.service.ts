import { api } from "./api";
import type { Lead, PaginatedResponse } from "@/types";

interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateLeadData {
  full_name: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  notes?: string;
  budget?: number;
}

export const leadsService = {
  async list(params: LeadListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params.sort_order) searchParams.set("sort_order", params.sort_order);
    return api.get<PaginatedResponse<Lead>>(`/leads?${searchParams}`);
  },

  async getById(id: string) {
    return api.get<{ data: Lead }>(`/leads/${id}`);
  },

  async create(data: CreateLeadData) {
    return api.post<{ data: Lead; message: string }>("/leads", data);
  },

  async update(id: string, data: Partial<CreateLeadData>) {
    return api.put<{ data: Lead; message: string }>(`/leads/${id}`, data);
  },

  async remove(id: string) {
    return api.delete<{ message: string }>(`/leads/${id}`);
  },
};
