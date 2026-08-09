import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
  search?: string;
}

export const propertiesService = {
  async list(orgId: string, options: ListOptions) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("properties")
      .select("*", { count: "exact" })
      .eq("org_id", orgId);

    if (search) {
      query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`);
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
      .from("properties")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !data) throw createAppError("Property not found", 404, "NOT_FOUND");
    return data;
  },

  async create(payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("properties")
      .insert({ ...payload, org_id: orgId })
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return data;
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("properties")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async remove(id: string, orgId: string) {
    const { error } = await supabaseAdmin
      .from("properties")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
  },
};
