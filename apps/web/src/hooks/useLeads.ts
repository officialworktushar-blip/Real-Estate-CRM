import { useState, useEffect, useCallback } from "react";
import { leadsService } from "@/services/leads.service";
import { apiErrorMessage } from "@/services/api";
import type { CreateLeadData } from "@/services/leads.service";
import type { Lead, PaginatedResponse } from "@/types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchLeads = useCallback(async (pageNum = 1, searchQuery = search) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await leadsService.list({ page: pageNum, limit: 20, search: searchQuery });
      setLeads(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to fetch leads"));
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLeads(page, search);
  }, [page, search, fetchLeads]);

  const refetch = useCallback(() => fetchLeads(page, search), [fetchLeads, page, search]);

  const create = useCallback(
    async (data: CreateLeadData) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await leadsService.create(data);
        setPage(1);
        await fetchLeads(1, search);
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to create lead"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [search, fetchLeads]
  );

  const update = useCallback(
    async (id: string, data: Partial<CreateLeadData>) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await leadsService.update(id, data);
        await refetch();
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to update lead"));
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
        await leadsService.remove(id);
        await refetch();
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to delete lead"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    leads,
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
