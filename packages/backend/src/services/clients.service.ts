import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
  search?: string;
}

export const clientsService = {
  async list(orgId: string | null, options: ListOptions) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from("contacts").select("*", { count: "exact" });
    if (orgId) query = query.eq("org_id", orgId);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");

    return {
      data,
      meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
    };
  },

  async getById(id: string, orgId: string | null) {
    let query = supabaseAdmin.from("contacts").select("*").eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.maybeSingle();
    if (error || !data) throw createAppError("Client not found", 404, "NOT_FOUND");
    return data;
  },

  async create(payload: Record<string, unknown>, orgId: string | null) {
    if (!orgId) throw createAppError("No organization linked to this account", 400, "NO_ORGANIZATION");
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .insert({ ...toContactsPayload(payload), org_id: orgId })
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return data;
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string | null) {
    let query = supabaseAdmin
      .from("contacts")
      .update({ ...toContactsPayload(payload), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.select().single();
    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async remove(id: string, orgId: string | null) {
    let query = supabaseAdmin.from("contacts").delete().eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.select().single();
    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
    return data;
  },
};

// The frontend sends the legacy first_name/last_name/client_type contract, but
// the deployed "contacts" table uses full_name / type. Adapt so creates and
// updates work against the real columns.
function toContactsPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = { ...payload };
  if (row.first_name || row.last_name) {
    row.full_name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  }
  if (row.client_type) row.type = row.client_type;
  delete row.first_name;
  delete row.last_name;
  delete row.client_type;
  delete row.total_transactions;
  delete row.lifetime_value;
  return row;
}
