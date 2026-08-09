import { api } from "./api";
import type { Property, PaginatedResponse } from "@/types";

interface PropertyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  property_type?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreatePropertyData {
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  property_type: string;
  status?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
  mls_number?: string;
  features?: string[];
}

export const propertiesService = {
  async list(params: PropertyListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.status) searchParams.set("status", params.status);
    if (params.property_type) searchParams.set("property_type", params.property_type);
    if (params.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params.sort_order) searchParams.set("sort_order", params.sort_order);
    return api.get<PaginatedResponse<Property>>(`/properties?${searchParams}`);
  },

  async getById(id: string) {
    return api.get<{ data: Property }>(`/properties/${id}`);
  },

  async create(data: CreatePropertyData) {
    return api.post<{ data: Property; message: string }>("/properties", data);
  },

  async update(id: string, data: Partial<CreatePropertyData>) {
    return api.put<{ data: Property; message: string }>(`/properties/${id}`, data);
  },

  async remove(id: string) {
    return api.delete<{ message: string }>(`/properties/${id}`);
  },
};
