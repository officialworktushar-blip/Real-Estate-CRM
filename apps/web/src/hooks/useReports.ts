import { useState, useEffect, useCallback, useRef } from "react";
import { reportsService } from "@/services/reports.service";
import type { PipelineStage, PerformanceData, RevenueData } from "@/services/reports.service";

const HOOK_SAFETY_TIMEOUT_MS = 5_000;

export function useReports() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchAll = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const [pipelineRes, performanceRes, revenueRes] = await Promise.allSettled([
        reportsService.pipeline(),
        reportsService.performance(),
        reportsService.revenue(),
      ]);

      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;

      if (pipelineRes.status === "fulfilled") setPipeline(pipelineRes.value.data);
      if (performanceRes.status === "fulfilled") setPerformance(performanceRes.value.data);
      if (revenueRes.status === "fulfilled") setRevenue(revenueRes.value.data);

      const errors = [pipelineRes, performanceRes, revenueRes]
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason?.message);

      if (errors.length > 0) {
        setError(errors.filter(Boolean).join("; "));
      }
    } catch (err) {
      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
    } finally {
      if (mountedRef.current && fetchIdRef.current === fetchId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => { mountedRef.current = false; };
  }, [fetchAll]);

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, HOOK_SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  return {
    pipeline,
    performance,
    revenue,
    isLoading,
    error,
    refetch: fetchAll,
  };
}
