import { api } from "./api";

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

export interface PerformanceData {
  conversion_rate: number;
  avg_deal_size: number;
  avg_days_to_close: number;
  total_leads: number;
  total_deals: number;
  total_revenue: number;
}

export interface RevenueData {
  month: string;
  value: number;
}

export interface ReportSummary {
  total_leads: number;
  total_properties: number;
  total_deals: number;
  total_clients: number;
  pipeline_value: number;
  closed_value: number;
  conversion_rate: number;
}

export const reportsService = {
  async pipeline() {
    return api.get<{ data: PipelineStage[] }>("/reports/pipeline");
  },

  async performance(params?: { start?: string; end?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.start) searchParams.set("start", params.start);
    if (params?.end) searchParams.set("end", params.end);
    const qs = searchParams.toString();
    return api.get<{ data: PerformanceData }>(`/reports/performance${qs ? `?${qs}` : ""}`);
  },

  async revenue(params?: { start?: string; end?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.start) searchParams.set("start", params.start);
    if (params?.end) searchParams.set("end", params.end);
    const qs = searchParams.toString();
    return api.get<{ data: RevenueData[] }>(`/reports/revenue${qs ? `?${qs}` : ""}`);
  },
};
