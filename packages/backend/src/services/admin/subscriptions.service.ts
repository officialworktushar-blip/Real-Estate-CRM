import { supabaseAdmin } from "../../config/supabase";
import { createAppError } from "../../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
}

export const adminSubscriptionsService = {
  async list(options: ListOptions) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*, organizations(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    return {
      data,
      meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
    };
  },

  async update(id: string, payload: { plan?: string; status?: string }) {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async stats() {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, status");

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    const grouped: Record<string, { plan: string; status: string; count: number }> = {};
    for (const row of data || []) {
      const key = `${row.plan}|${row.status}`;
      if (!grouped[key]) grouped[key] = { plan: row.plan, status: row.status, count: 0 };
      grouped[key].count += 1;
    }

    return Object.values(grouped);
  },
};
