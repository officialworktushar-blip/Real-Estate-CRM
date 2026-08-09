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
      .from("invoices")
      .select("amount, provider, status, paid_at, created_at");

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    const byMonth: Record<string, { stripe: number; razorpay: number; total: number }> = {};
    for (const row of data || []) {
      if (row.status !== "paid" && row.status !== "succeeded") continue;
      const amount = Number(row.amount) || 0;
      const date = new Date(row.paid_at || row.created_at);
      if (Number.isNaN(date.getTime())) continue;
      const month = date.toISOString().slice(0, 7);
      const bucket = (byMonth[month] ??= { stripe: 0, razorpay: 0, total: 0 });
      if (row.provider === "razorpay") bucket.razorpay += amount;
      else bucket.stripe += amount;
      bucket.total += amount;
    }

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));
  },
};
