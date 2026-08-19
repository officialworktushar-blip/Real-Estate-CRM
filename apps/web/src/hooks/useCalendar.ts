import { useState, useEffect, useCallback, useRef } from "react";
import { calendarService } from "@/services/calendar.service";
import type { CalendarEvent } from "@/types";

export function useCalendar(start?: string, end?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchEvents = useCallback(async (startDate?: string, endDate?: string) => {
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const res = await calendarService.list({
        start: startDate,
        end: endDate,
      });
      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;
      setEvents(res.data);
    } catch (err) {
      if (!mountedRef.current || fetchIdRef.current !== fetchId) return;
      setError(err instanceof Error ? err.message : "Failed to fetch calendar events");
    } finally {
      if (mountedRef.current && fetchIdRef.current === fetchId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchEvents(start, end);
    return () => { mountedRef.current = false; };
  }, [start, end, fetchEvents]);

  const refetch = useCallback(() => fetchEvents(start, end), [fetchEvents, start, end]);

  return {
    events,
    isLoading,
    error,
    refetch,
  };
}
