import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const leadsService = {
  async list(orgId: string | null, options: ListOptions) {
    const { page, limit, search, sortBy = "created_at", sortOrder = "desc" } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from("leads").select("*", { count: "exact" });
    if (orgId) query = query.eq("org_id", orgId);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    return {
      data,
      meta: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    };
  },

  async getById(id: string, orgId: string | null) {
    let query = supabaseAdmin.from("leads").select("*").eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.maybeSingle();
    if (error || !data) throw createAppError("Lead not found", 404, "NOT_FOUND");
    return data;
  },

  async create(payload: Record<string, unknown>, orgId: string | null) {
    if (!orgId) throw createAppError("No organization linked to this account", 400, "NO_ORGANIZATION");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({ ...toLeadsPayload(payload), org_id: orgId })
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return data;
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string | null) {
    let query = supabaseAdmin
      .from("leads")
      .update({ ...toLeadsPayload(payload), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.select().single();
    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async remove(id: string, orgId: string | null) {
    let query = supabaseAdmin.from("leads").delete().eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { error } = await query;
    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
  },
};

// The frontend sends the legacy first_name/last_name/budget_min contract, but
// the deployed "leads" table uses full_name (and has no per-min/max budget or
// property-type preference columns). Adapt the payload so creates and updates
// succeed instead of failing on non-existent columns.
function toLeadsPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = { ...payload };
  const first = typeof row.first_name === "string" ? row.first_name : "";
  const last = typeof row.last_name === "string" ? row.last_name : "";
  if (first || last) row.full_name = [first, last].filter(Boolean).join(" ").trim();
  delete row.first_name;
  delete row.last_name;
  delete row.budget_min;
  delete row.budget_max;
  delete row.preferred_location;
  delete row.property_type_preference;
  return row;
}
