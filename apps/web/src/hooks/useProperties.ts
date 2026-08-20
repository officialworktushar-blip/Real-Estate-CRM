import { useState, useEffect, useCallback, useRef } from "react";
import { propertiesService } from "@/services/properties.service";
import { apiErrorMessage } from "@/services/api";
import { toast } from "@/stores/toastStore";
import type { CreatePropertyData } from "@/services/properties.service";
import type { Property, PaginatedResponse } from "@/types";

const HOOK_SAFETY_TIMEOUT_MS = 5_000;

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchProperties = useCallback(async (pageNum: number, searchQuery: string) => {
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const res = await propertiesService.list({ page: pageNum, limit: 20, search: searchQuery });
      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;
      setProperties(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;
      setError(apiErrorMessage(err, "Failed to fetch properties"));
    } finally {
      if (mountedRef.current && fetchIdRef.current === fetchId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchProperties(page, search);
    return () => { mountedRef.current = false; };
  }, [page, search, fetchProperties]);

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, HOOK_SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const refetch = useCallback(() => fetchProperties(page, search), [fetchProperties, page, search]);

  const create = useCallback(
    async (data: CreatePropertyData) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await propertiesService.create(data);
        setPage(1);
        await fetchProperties(1, search);
        toast("success", "Property added successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to create property"));
        toast("error", apiErrorMessage(err, "Failed to create property"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [search, fetchProperties]
  );

  const update = useCallback(
    async (id: string, data: Partial<CreatePropertyData>) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await propertiesService.update(id, data);
        await refetch();
        toast("success", "Property updated successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to update property"));
        toast("error", apiErrorMessage(err, "Failed to update property"));
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
        await propertiesService.remove(id);
        await refetch();
        toast("success", "Property deleted successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to delete property"));
        toast("error", apiErrorMessage(err, "Failed to delete property"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    properties,
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
