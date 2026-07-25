import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import type { Lead, PaginatedResponse } from "@/types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLeads = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await api.get<PaginatedResponse<Lead>>(`/leads?${params}`);
      setLeads(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, meta, isLoading, search, setSearch, refetch: fetchLeads };
}
