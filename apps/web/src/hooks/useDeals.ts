import { useState, useEffect, useCallback } from "react";
import { dealsService } from "@/services/deals.service";
import { apiErrorMessage } from "@/services/api";
import { toast } from "@/stores/toastStore";
import type { CreateDealData } from "@/services/deals.service";
import type { Deal, PaginatedResponse } from "@/types";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("");
  const [page, setPage] = useState(1);

  const fetchDeals = useCallback(async (pageNum = 1, searchQuery = search, stageFilter = stage) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dealsService.list({
        page: pageNum,
        limit: 50,
        search: searchQuery || undefined,
        stage: stageFilter || undefined,
      });
      setDeals(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to fetch deals"));
    } finally {
      setIsLoading(false);
    }
  }, [search, stage]);

  useEffect(() => {
    fetchDeals(page, search, stage);
  }, [page, search, stage, fetchDeals]);

  const refetch = useCallback(() => fetchDeals(page, search, stage), [fetchDeals, page, search, stage]);

  const updateDealStage = useCallback(
    async (dealId: string, newStage: string) => {
      try {
        await dealsService.update(dealId, { stage: newStage });
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
        );
      } catch (err) {
        setError(apiErrorMessage(err, "Failed to update deal"));
      }
    },
    []
  );

  const create = useCallback(
    async (data: CreateDealData) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await dealsService.create(data);
        setPage(1);
        await fetchDeals(1, search, stage);
        toast("success", "Deal created successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to create deal"));
        toast("error", apiErrorMessage(err, "Failed to create deal"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [search, stage, fetchDeals]
  );

  const update = useCallback(
    async (id: string, data: Partial<CreateDealData>) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await dealsService.update(id, data);
        await refetch();
        toast("success", "Deal updated successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to update deal"));
        toast("error", apiErrorMessage(err, "Failed to update deal"));
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
        await dealsService.remove(id);
        await refetch();
        toast("success", "Deal deleted successfully");
        return true;
      } catch (err) {
        setSubmitError(apiErrorMessage(err, "Failed to delete deal"));
        toast("error", apiErrorMessage(err, "Failed to delete deal"));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    deals,
    meta,
    isLoading,
    error,
    submitError,
    isSubmitting,
    search,
    setSearch: (q: string) => { setSearch(q); setPage(1); },
    stage,
    setStage: (s: string) => { setStage(s); setPage(1); },
    page,
    setPage,
    refetch,
    updateDealStage,
    create,
    update,
    remove,
  };
}
