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

export const calendarService = {
  async list(orgId: string, _userId: string, range: DateRange) {
    let query = supabaseAdmin
      .from(ACTIVITIES_TABLE)
      .select("*")
      .eq("org_id", orgId);

    if (range.start) query = query.gte("due_date", range.start);
    if (range.end) query = query.lte("due_date", range.end);

    const { data, error } = await query.order("due_date", { ascending: true });

    if (error) {
      console.warn(
        "[calendar] activities query failed, returning empty result:",
        error.message
      );
      return [];
    }
    return (data as ActivityRow[])?.map(toContract) || [];
  },

  async getById(id: string, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from(ACTIVITIES_TABLE)
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !data) throw createAppError("Event not found", 404, "NOT_FOUND");
    return toContract(data as ActivityRow);
  },

  async create(payload: Record<string, unknown>, orgId: string, userId: string) {
    const row = {
      title: payload.title,
      description: payload.description ?? null,
      type: payload.event_type ?? "meeting",
      due_date: payload.start_time ?? null,
      performed_by: userId,
      org_id: orgId,
    };

    const { data, error } = await supabaseAdmin
      .from(ACTIVITIES_TABLE)
      .insert(row)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "CREATE_FAILED");
    return toContract(data as ActivityRow);
  },

  async update(id: string, payload: Record<string, unknown>, orgId: string) {
    const row: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if ("title" in payload) row.title = payload.title;
    if ("description" in payload) row.description = payload.description ?? null;
    if ("event_type" in payload) row.type = payload.event_type;
    if ("start_time" in payload) row.due_date = payload.start_time;

    const { data, error } = await supabaseAdmin
      .from(ACTIVITIES_TABLE)
      .update(row)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw createAppError(error.message, 400, "UPDATE_FAILED");
    return toContract(data as ActivityRow);
  },

  async remove(id: string, orgId: string) {
    const { error } = await supabaseAdmin
      .from(ACTIVITIES_TABLE)
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw createAppError(error.message, 400, "DELETE_FAILED");
  },
};
