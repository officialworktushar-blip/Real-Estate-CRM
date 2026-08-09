import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
  search?: string;
  stage?: string;
}

export const dealsService = {
  async list(orgId: string, options: ListOptions) {
    const { page, limit, search, stage } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("deals")
      .select("*, leads(full_name, email, phone), properties(title, address, price)", { count: "exact" })
      .eq("org_id", orgId);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (stage) {
      query = query.eq("stage", stage);
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
      .from("deals")
      .select("*, leads(*), properties(*)")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !data) throw createAppError("Deal not found", 404, "NOT_FOUND");
    return data;
  },

  async create(payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert({ ...toDealsPayload(payload), org_id: orgId })
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return data;
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .update({ ...toDealsPayload(payload), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async remove(id: string, orgId: string) {
    const { error } = await supabaseAdmin
      .from("deals")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
  },
};

// The frontend sends the legacy commission_amount/client_id contract, but the
// deployed "deals" table has no such columns and links to leads instead of
// clients. Adapt the payload so creates and updates succeed.
function toDealsPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = { ...payload };
  delete row.commission_amount;
  delete row.clients;
  if ("client_id" in row && !("lead_id" in row)) row.lead_id = row.client_id;
  delete row.client_id;
  return row;
}
