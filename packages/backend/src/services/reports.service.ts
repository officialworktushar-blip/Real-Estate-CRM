import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface DateRange {
  start?: string;
  end?: string;
}

export const reportsService = {
  async pipeline(orgId: string) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("stage, count:id, sum:value")
      .eq("organization_id", orgId)
      .group("stage");

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");
    return data;
  },

  async performance(orgId: string, _range: DateRange) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("assigned_to, count:id, sum:commission_amount")
      .eq("organization_id", orgId)
      .eq("stage", "closed_won")
      .group("assigned_to");

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");
    return data;
  },

  async revenue(orgId: string, _range: DateRange) {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("created_at, value, commission_amount")
      .eq("organization_id", orgId)
      .eq("stage", "closed_won")
      .order("created_at", { ascending: true });

    if (error) throw createAppError(error.message, 500, "DATABASE_ERROR");
    return data;
  },
};
