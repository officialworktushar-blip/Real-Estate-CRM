import { useState, useEffect, useCallback } from "react";
import { reportsService } from "@/services/reports.service";
import type { PipelineStage, PerformanceData, RevenueData } from "@/services/reports.service";

export function useReports() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pipelineRes, performanceRes, revenueRes] = await Promise.allSettled([
        reportsService.pipeline(),
        reportsService.performance(),
        reportsService.revenue(),
      ]);

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
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    pipeline,
    performance,
    revenue,
    isLoading,
    error,
    refetch: fetchAll,
  };
}
