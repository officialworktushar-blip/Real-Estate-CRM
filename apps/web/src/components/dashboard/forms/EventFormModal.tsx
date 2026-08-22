import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select, SelectOption } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import type { CreateEventData } from "@/services/calendar.service";

export const CALENDAR_EVENT_TYPE_OPTIONS: SelectOption[] = [
  { value: "meeting", label: "Meeting" },
  { value: "viewing", label: "Viewing" },
  { value: "open_house", label: "Open House" },
  { value: "closing", label: "Closing" },
  { value: "follow_up", label: "Follow Up" },
  { value: "inspection", label: "Inspection" },
];

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventData) => Promise<boolean>;
  isSubmitting: boolean;
  submitError?: string | null;
  initialDate?: string;
}

interface FormState {
  title: string;
  event_type: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

function defaultDate(initialDate?: string): string {
  if (initialDate) return initialDate;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

const emptyState = (initialDate?: string): FormState => ({
  title: "",
  event_type: "meeting",
  date: defaultDate(initialDate),
  time: "",
  location: "",
  description: "",
});

export function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
  initialDate,
}: EventFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(emptyState(initialDate));
      setErrors({});
    }
  }, [isOpen, initialDate]);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.date.trim()) nextErrors.date = "Date is required";
    if (!form.time.trim()) nextErrors.time = "Time is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateEventData = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      event_type: form.event_type || "meeting",
      start_time: `${form.date}T${form.time}:00`,
      end_time: `${form.date}T${form.time}:00`,
      location: form.location.trim() || undefined,
    };

    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Event" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Site visit with client"
          error={errors.title}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Type"
            value={form.event_type}
            onChange={(e) => set("event_type", e.target.value)}
            options={CALENDAR_EVENT_TYPE_OPTIONS}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Office / site address"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            error={errors.date}
            required
          />
          <Input
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            error={errors.time}
            required
          />
        </div>
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="Optional notes..."
        />
        {submitError && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {submitError}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
