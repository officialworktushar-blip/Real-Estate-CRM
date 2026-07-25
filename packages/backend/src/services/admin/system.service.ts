import { supabaseAdmin } from "../../config/supabase";
import { createAppError } from "../../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
}

export const adminSystemService = {
  async health() {
    const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    return {
      database: error ? "disconnected" : "connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  },

  async stats() {
    const [users, orgs, leads, deals] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("organizations").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("deals").select("id", { count: "exact", head: true }),
    ]);

    return {
      total_users: users.count || 0,
      total_organizations: orgs.count || 0,
      total_leads: leads.count || 0,
      total_deals: deals.count || 0,
    };
  },

  async auditLogs(options: ListOptions) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*, profiles:user_id(full_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    return {
      data,
      meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
    };
  },
};
