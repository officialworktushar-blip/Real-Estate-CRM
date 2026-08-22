import { useState, useEffect, useCallback, useRef } from "react";
import { calendarService, type CreateEventData } from "@/services/calendar.service";
import { toast } from "@/stores/toastStore";
import { apiErrorMessage } from "@/services/api";
import type { CalendarEvent } from "@/types";

const HOOK_SAFETY_TIMEOUT_MS = 5_000;

export function useCalendar(start?: string, end?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, HOOK_SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const refetch = useCallback(() => fetchEvents(start, end), [fetchEvents, start, end]);

  const createEvent = useCallback(
    async (data: CreateEventData): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await calendarService.create(data);
        toast("success", "Event created successfully");
        await fetchEvents(start, end);
        return true;
      } catch (err) {
        const message = apiErrorMessage(err, "Failed to create event");
        setSubmitError(message);
        toast("error", message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchEvents, start, end]
  );

  return {
    events,
    isLoading,
    error,
    refetch,
    createEvent,
    isSubmitting,
    submitError,
  };
}
