import { useState, useEffect, useCallback } from "react";
import { clientsService } from "@/services/clients.service";
import type { Client, PaginatedResponse } from "@/types";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchClients = useCallback(async (pageNum = 1, searchQuery = search) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientsService.list({ page: pageNum, limit: 20, search: searchQuery });
      setClients(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchClients(page, search);
  }, [page, search, fetchClients]);

  const refetch = useCallback(() => fetchClients(page, search), [fetchClients, page, search]);

  return {
    clients,
    meta,
    isLoading,
    error,
    search,
    setSearch: (q: string) => { setSearch(q); setPage(1); },
    page,
    setPage,
    refetch,
  };
}
