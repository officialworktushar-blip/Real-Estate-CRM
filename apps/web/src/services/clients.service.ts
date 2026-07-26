import { api } from "./api";
import type { Client, PaginatedResponse } from "@/types";

interface ClientListParams {
  page?: number;
  limit?: number;
  search?: string;
  client_type?: string;
}

interface CreateClientData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  client_type: string;
}

export const clientsService = {
  async list(params: ClientListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.client_type) searchParams.set("client_type", params.client_type);
    return api.get<PaginatedResponse<Client>>(`/clients?${searchParams}`);
  },

  async getById(id: string) {
    return api.get<{ data: Client }>(`/clients/${id}`);
  },

  async create(data: CreateClientData) {
    return api.post<{ data: Client; message: string }>("/clients", data);
  },

  async update(id: string, data: Partial<CreateClientData>) {
    return api.put<{ data: Client; message: string }>(`/clients/${id}`, data);
  },

  async remove(id: string) {
    return api.delete<{ message: string }>(`/clients/${id}`);
  },
};
