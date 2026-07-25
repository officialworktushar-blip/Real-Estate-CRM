import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface DateRange {
  start?: string;
  end?: string;
}

export const calendarService = {
  async list(orgId: string, userId: string, range: DateRange) {
    let query = supabaseAdmin
      .from("calendar_events")
      .select("*")
      .eq("organization_id", orgId)
      .eq("user_id", userId);

    if (range.start) query = query.gte("start_time", range.start);
    if (range.end) query = query.lte("end_time", range.end);

    const { data, error } = await query.order("start_time", { ascending: true });

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");
    return data;
  },

  async getById(id: string, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("calendar_events")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (error || !data) throw createAppError("Event not found", 404, "NOT_FOUND");
    return data;
  },

  async create(payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("calendar_events")
      .insert({ ...payload, organization_id: orgId })
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return data;
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("calendar_events")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return data;
  },

  async remove(id: string, orgId: string) {
    const { error } = await supabaseAdmin
      .from("calendar_events")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
  },
};
