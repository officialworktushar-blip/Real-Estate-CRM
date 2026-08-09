import { api } from "./api";
import type { Deal, PaginatedResponse } from "@/types";

interface DealListParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
}

export interface CreateDealData {
  title: string;
  stage?: string;
  value: number;
  expected_close_date?: string;
  notes?: string;
  property_id?: string;
  lead_id?: string;
}

export const dealsService = {
  async list(params: DealListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.stage) searchParams.set("stage", params.stage);
    return api.get<PaginatedResponse<Deal>>(`/deals?${searchParams}`);
  },

  async getById(id: string) {
    return api.get<{ data: Deal }>(`/deals/${id}`);
  },

  async create(data: CreateDealData) {
    return api.post<{ data: Deal; message: string }>("/deals", data);
  },

  async update(id: string, data: Partial<CreateDealData>) {
    return api.put<{ data: Deal; message: string }>(`/deals/${id}`, data);
  },

  async remove(id: string) {
    return api.delete<{ message: string }>(`/deals/${id}`);
  },
};
