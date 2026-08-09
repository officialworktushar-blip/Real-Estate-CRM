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
    const [users, orgs, leads, deals, properties, subs] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("organizations").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("deals").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("properties").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }),
    ]);

    const activeSubs = await supabaseAdmin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    return {
      total_users: users.count || 0,
      total_organizations: orgs.count || 0,
      total_leads: leads.count || 0,
      total_deals: deals.count || 0,
      total_properties: properties.count || 0,
      total_subscriptions: subs.count || 0,
      active_subscriptions: activeSubs.count || 0,
    };
  },

  async auditLogs(options: ListOptions) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabaseAdmin
      .from("admin_logs")
      .select("*, profiles!admin_logs_admin_id_fkey(full_name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    return {
      data: (data || []).map((row) => ({
        id: row.id,
        user_id: row.admin_id,
        action: row.action,
        entity_type: row.target_type,
        entity_id: row.target_id,
        details: row.details,
        created_at: row.created_at,
        profiles: row.profiles || undefined,
      })),
      meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
    };
  },
};
