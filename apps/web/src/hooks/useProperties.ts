import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import type { Property, PaginatedResponse } from "@/types";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProperties = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await api.get<PaginatedResponse<Property>>(`/properties?${params}`);
      setProperties(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, meta, isLoading, search, setSearch, refetch: fetchProperties };
}
