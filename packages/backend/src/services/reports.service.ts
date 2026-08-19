import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface DateRange {
  start?: string;
  end?: string;
}

export const reportsService = {
  async pipeline(orgId: string | null) {
    let query = supabaseAdmin.from("deals").select("stage, value");
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query;
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

  async performance(orgId: string | null, _range: DateRange) {
    let query = supabaseAdmin.from("deals").select("assigned_to, value").eq("stage", "closed_won");
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query;
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

  async revenue(orgId: string | null, _range: DateRange) {
    let query = supabaseAdmin
      .from("deals")
      .select("value, created_at, expected_close_date")
      .eq("stage", "closed_won");
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query;
    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    const months: Record<string, number> = {};
    for (const deal of data || []) {
      const date = new Date(deal.expected_close_date || deal.created_at);
      if (Number.isNaN(date.getTime())) continue;
      const month = date.toISOString().slice(0, 7);
      months[month] = (months[month] || 0) + (Number(deal.value) || 0);
    }

    return Object.entries(months).map(([month, total]) => ({
      month,
      total,
    }));
  },
};
