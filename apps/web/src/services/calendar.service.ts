import { api } from "./api";
import type { CalendarEvent } from "@/types";

interface CalendarListParams {
  start?: string;
  end?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location?: string;
}

export const calendarService = {
  async list(params: CalendarListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.start) searchParams.set("start", params.start);
    if (params.end) searchParams.set("end", params.end);
    const qs = searchParams.toString();
    return api.get<{ data: CalendarEvent[] }>(`/calendar${qs ? `?${qs}` : ""}`);
  },

  async getById(id: string) {
    return api.get<{ data: CalendarEvent }>(`/calendar/${id}`);
  },

  async create(data: CreateEventData) {
    return api.post<{ data: CalendarEvent; message: string }>("/calendar", data);
  },

  async update(id: string, data: Partial<CreateEventData>) {
    return api.put<{ data: CalendarEvent; message: string }>(`/calendar/${id}`, data);
  },

  async remove(id: string) {
    return api.delete<{ message: string }>(`/calendar/${id}`);
  },
};
