import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface DateRange {
  start?: string;
  end?: string;
}

export const reportsService = {
  async pipeline(orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("stage, value")
      .eq("org_id", orgId);

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    const grouped: Record<string, { count: number; total_value: number }> = {};
    for (const deal of data || []) {
      const stage = deal.stage || "unknown";
      if (!grouped[stage]) grouped[stage] = { count: 0, total_value: 0 };
      grouped[stage].count += 1;
      grouped[stage].total_value += Number(deal.value) || 0;
    }

    return Object.entries(grouped).map(([stage, stats]) => ({
      stage,
      count: stats.count,
      total_value: stats.total_value,
    }));
  },

  async performance(orgId: string, _range: DateRange) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("assigned_to, value")
      .eq("org_id", orgId)
      .eq("stage", "closed_won");

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    const grouped: Record<string, { count: number; total_value: number }> = {};
    for (const deal of data || []) {
      const agent = deal.assigned_to || "unassigned";
      if (!grouped[agent]) grouped[agent] = { count: 0, total_value: 0 };
      grouped[agent].count += 1;
      grouped[agent].total_value += Number(deal.value) || 0;
    }

    return Object.entries(grouped).map(([assigned_to, stats]) => ({
      assigned_to,
      count: stats.count,
      total_value: stats.total_value,
    }));
  },

  async revenue(orgId: string, _range: DateRange) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("created_at, value")
      .eq("org_id", orgId)
      .eq("stage", "closed_won")
      .order("created_at", { ascending: true });

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");
    return data;
  },
};
