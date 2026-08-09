import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

interface DateRange {
  start?: string;
  end?: string;
}

const ACTIVITIES_TABLE = "activities";

// The dashboard calendar is backed by the "activities" table in the deployed
// Supabase schema. The frontend calendar contract uses event_type / start_time
// / end_time / location, so we adapt between that contract and the real columns
// (type / due_date). list() also degrades gracefully to [] instead of 500ing
// if the table is unavailable for any reason.
interface ActivityRow {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  due_date?: string | null;
  completed?: boolean | null;
  performed_by?: string | null;
  related_to_id?: string | null;
  related_to_type?: string | null;
  created_at: string;
}

function toContract(row: ActivityRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    event_type: row.type || "meeting",
    start_time: row.due_date || row.created_at,
    end_time: row.due_date || row.created_at,
    location: undefined,
    created_at: row.created_at,
    completed: row.completed ?? false,
    related_to_id: row.related_to_id,
    related_to_type: row.related_to_type,
  };
}

function toActivityPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = { ...payload };
  if (row.event_type && !row.type) row.type = row.event_type;
  if (row.start_time && !row.due_date) row.due_date = row.start_time;
  delete row.event_type;
  delete row.start_time;
  delete row.end_time;
  delete row.location;
  return row;
}

export const calendarService = {
  async list(orgId: string | null, _userId: string, range: DateRange) {
    let query = supabaseAdmin.from(ACTIVITIES_TABLE).select("*");
    if (orgId) query = query.eq("org_id", orgId);

    if (range.start) query = query.gte("due_date", range.start);
    if (range.end) query = query.lte("due_date", range.end);

    const { data, error } = await query.order("due_date", { ascending: true });

    if (error) {
      console.warn("[calendar] list failed, returning []:", error.message);
      return [];
    }

    return (data || []).map(toContract);
  },

  async getById(id: string, orgId: string | null) {
    let query = supabaseAdmin.from(ACTIVITIES_TABLE).select("*").eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.maybeSingle();
    if (error || !data) throw createAppError("Event not found", 404, "NOT_FOUND");
    return toContract(data);
  },

  async create(payload: Record<string, unknown>, orgId: string | null, userId: string) {
    if (!orgId) throw createAppError("No organization linked to this account", 400, "NO_ORGANIZATION");
    const { data, error } = await supabaseAdmin
      .from(ACTIVITIES_TABLE)
      .insert({ ...toActivityPayload(payload), org_id: orgId, performed_by: userId })
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return toContract(data);
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string | null) {
    let query = supabaseAdmin
      .from(ACTIVITIES_TABLE)
      .update({ ...toActivityPayload(payload), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.select().single();
    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return toContract(data);
  },

  async remove(id: string, orgId: string | null) {
    let query = supabaseAdmin.from(ACTIVITIES_TABLE).delete().eq("id", id);
    if (orgId) query = query.eq("org_id", orgId);

    const { data, error } = await query.select().single();
    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
    return data;
  },
};
