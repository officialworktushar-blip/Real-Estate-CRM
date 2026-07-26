import { useState, useEffect, useCallback } from "react";
import { calendarService } from "@/services/calendar.service";
import type { CalendarEvent } from "@/types";

export function useCalendar(start?: string, end?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await calendarService.list({
        start: startDate,
        end: endDate,
      });
      setEvents(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch calendar events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(start, end);
  }, [start, end, fetchEvents]);

  const refetch = useCallback(() => fetchEvents(start, end), [fetchEvents, start, end]);

  return {
    events,
    isLoading,
    error,
    refetch,
  };
}
