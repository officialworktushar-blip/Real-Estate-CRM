import { useState, useEffect, useCallback } from "react";
import { clientsService } from "@/services/clients.service";
import { apiErrorMessage } from "@/services/api";
import type { CreateClientData } from "@/services/clients.service";
import type { Client, PaginatedResponse } from "@/types";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setError(apiErrorMessage(err, "Failed to fetch clients"));
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchClients(page, search);
  }, [page, search, fetchClients]);

  const refetch = useCallback(() => fetchClients(page, search), [fetchClients, page, search]);

  const create = useCallback(
    async (data: CreateClientData) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await clientsService.create(data);
        setPage(1);
        await fetchClients(1, search);
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to create client"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [search, fetchClients]
  );

  const update = useCallback(
    async (id: string, data: Partial<CreateClientData>) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await clientsService.update(id, data);
        await refetch();
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to update client"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  const remove = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await clientsService.remove(id);
        await refetch();
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to delete client"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    clients,
    meta,
    isLoading,
    error,
    submitError,
    isSubmitting,
    search,
    setSearch: (q: string) => { setSearch(q); setPage(1); },
    page,
    setPage,
    refetch,
    create,
    update,
    remove,
  };
}
