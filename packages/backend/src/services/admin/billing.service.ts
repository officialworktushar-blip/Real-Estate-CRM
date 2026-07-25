import { supabaseAdmin } from "../../config/supabase";
import { createAppError } from "../../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
}

interface DateRange {
  start?: string;
  end?: string;
}

export const adminBillingService = {
  async list(options: ListOptions) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*, organizations(name)", { count: "exact" })
      .neq("plan", "free")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    return {
      data,
      meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
    };
  },

  async revenue(_range: DateRange) {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, count:id")
      .neq("plan", "free")
      .eq("status", "active")
      .group("plan");

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    const prices: Record<string, number> = { starter: 29, professional: 79, enterprise: 199 };

    return {
      plans: data,
      estimated_mrr: data?.reduce((sum, row) => sum + (prices[row.plan] || 0) * (row.count || 0), 0) || 0,
    };
  },
};
