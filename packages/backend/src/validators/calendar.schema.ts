import { z } from "zod";

export const calendarEventTypeSchema = z.enum([
  "meeting",
  "task",
  "viewing",
  "open_house",
  "closing",
  "follow_up",
  "inspection",
]);

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  event_type: calendarEventTypeSchema.default("meeting"),
  start_time: z.string().min(1, "Event date/time is required"),
  end_time: z.string().optional(),
  location: z.string().optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();
