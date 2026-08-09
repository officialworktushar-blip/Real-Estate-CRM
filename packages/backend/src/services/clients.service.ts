import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
  search?: string;
}

export const clientsService = {
  async list(orgId: string, options: ListOptions) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact" })
      .eq("org_id", orgId);

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

  async getById(id: string, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !data) throw createAppError("Client not found", 404, "NOT_FOUND");
    return data;
  },

  async create(payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .insert({ ...toContactsPayload(payload), org_id: orgId })
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return data;
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .update({ ...toContactsPayload(payload), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async remove(id: string, orgId: string) {
    const { error } = await supabaseAdmin
      .from("contacts")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
  },
};

// The frontend sends the legacy first_name/last_name/client_type contract, while
// the deployed "contacts" table uses full_name/type. Adapt here so creates and
// updates succeed instead of failing on non-existent columns.
function toContactsPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = { ...payload };
  const first = typeof row.first_name === "string" ? row.first_name : "";
  const last = typeof row.last_name === "string" ? row.last_name : "";
  if (first || last) row.full_name = [first, last].filter(Boolean).join(" ").trim();
  if ("client_type" in row) row.type = row.client_type;
  delete row.first_name;
  delete row.last_name;
  delete row.client_type;
  delete row.total_transactions;
  delete row.lifetime_value;
  return row;
}
