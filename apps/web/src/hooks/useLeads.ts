import { useState, useEffect, useCallback, useRef } from "react";
import { leadsService } from "@/services/leads.service";
import { apiErrorMessage } from "@/services/api";
import { toast } from "@/stores/toastStore";
import type { CreateLeadData } from "@/services/leads.service";
import type { Lead, PaginatedResponse } from "@/types";

const HOOK_SAFETY_TIMEOUT_MS = 5_000;

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchLeads = useCallback(async (pageNum: number, searchQuery: string) => {
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const res = await leadsService.list({ page: pageNum, limit: 20, search: searchQuery });
      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;
      setLeads(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;
      setError(apiErrorMessage(err, "Failed to fetch leads"));
    } finally {
      if (mountedRef.current && fetchIdRef.current === fetchId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchLeads(page, search);
    return () => { mountedRef.current = false; };
  }, [page, search, fetchLeads]);

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, HOOK_SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const refetch = useCallback(() => fetchLeads(page, search), [fetchLeads, page, search]);

  const create = useCallback(
    async (data: CreateLeadData) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await leadsService.create(data);
        setPage(1);
        await fetchLeads(1, search);
        toast("success", "Lead created successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to create lead"));
        toast("error", apiErrorMessage(err, "Failed to create lead"));
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
        toast("success", "Lead updated successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to update lead"));
        toast("error", apiErrorMessage(err, "Failed to update lead"));
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
        toast("success", "Lead deleted successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to delete lead"));
        toast("error", apiErrorMessage(err, "Failed to delete lead"));
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
