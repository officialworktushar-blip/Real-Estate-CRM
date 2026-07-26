import { useState, useEffect, useCallback } from "react";
import { dealsService } from "@/services/deals.service";
import type { Deal, PaginatedResponse } from "@/types";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(err instanceof Error ? err.message : "Failed to fetch deals");
    } finally {
      setIsLoading(false);
    }
  }, [search, stage]);

  useEffect(() => {
    fetchDeals(page, search, stage);
  }, [page, search, stage, fetchDeals]);

  const refetch = useCallback(() => fetchDeals(page, search, stage), [fetchDeals, page, search, stage]);

  const updateDealStage = useCallback(async (dealId: string, newStage: string) => {
    try {
      await dealsService.update(dealId, { stage: newStage });
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update deal");
    }
  }, []);

  return {
    deals,
    meta,
    isLoading,
    error,
    search,
    setSearch: (q: string) => { setSearch(q); setPage(1); },
    stage,
    setStage: (s: string) => { setStage(s); setPage(1); },
    page,
    setPage,
    refetch,
    updateDealStage,
  };
}
