import { supabaseAdmin } from "../../config/supabase";
import { createAppError } from "../../middleware/errorHandler";

interface ListOptions {
  page: number;
  limit: number;
  search?: string;
}

export const adminUsersService = {
  async list(options: ListOptions) {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("profiles")
      .select("*, users:user_id(email, created_at)", { count: "exact" });

    if (search) {
      query = query.ilike("full_name", `%${search}%`);
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

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*, users:user_id(email, created_at, last_sign_in_at)")
      .eq("id", id)
      .single();

    if (error || !data) throw createAppError("User not found", 404, "NOT_FOUND");
    return data;
  },

  async updateRole(id: string, role: string) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async deactivate(id: string) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("id", id)
      .single();

    if (profile?.user_id) {
      await supabaseAdmin.auth.admin.updateUserById(profile.user_id, {
        ban_duration: "none",
      });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
  },
};
