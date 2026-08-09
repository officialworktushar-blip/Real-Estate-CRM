import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select, SelectOption } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import type { Deal, Lead, Property } from "@/types";
import type { CreateDealData } from "@/services/deals.service";

export const DEAL_STAGE_OPTIONS: SelectOption[] = [
  { value: "lead", label: "Lead" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "contract", label: "Contract" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDealData) => Promise<boolean>;
  initialData?: Deal | null;
  leads: Lead[];
  properties: Property[];
  isSubmitting: boolean;
  submitError?: string | null;
}

interface FormState {
  title: string;
  stage: string;
  value: string;
  expected_close_date: string;
  lead_id: string;
  property_id: string;
  notes: string;
}

const emptyState: FormState = {
  title: "",
  stage: "lead",
  value: "",
  expected_close_date: "",
  lead_id: "",
  property_id: "",
  notes: "",
};

export function DealFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  leads,
  properties,
  isSubmitting,
  submitError,
}: DealFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              title: initialData.title || "",
              stage: initialData.stage || "lead",
              value: initialData.value != null ? String(initialData.value) : "",
              expected_close_date: initialData.expected_close_date
                ? initialData.expected_close_date.slice(0, 10)
                : "",
              lead_id: initialData.lead_id || "",
              property_id: initialData.property_id || "",
              notes: initialData.notes || "",
            }
          : emptyState
      );
      setErrors({});
    }
  }, [isOpen, initialData]);

  const leadOptions = useMemo(() => {
    const opts: SelectOption[] = leads.map((l) => ({
      value: l.id,
      label: l.full_name || l.email || l.id,
    }));
    if (initialData?.lead_id && !leads.some((l) => l.id === initialData.lead_id)) {
      opts.unshift({
        value: initialData.lead_id,
        label: initialData.leads?.full_name || initialData.lead_id,
      });
    }
    return opts;
  }, [leads, initialData]);

  const propertyOptions = useMemo(() => {
    const opts: SelectOption[] = properties.map((p) => ({
      value: p.id,
      label: p.title || p.id,
    }));
    if (initialData?.property_id && !properties.some((p) => p.id === initialData.property_id)) {
      opts.unshift({
        value: initialData.property_id,
        label: initialData.properties?.title || initialData.property_id,
      });
    }
    return opts;
  }, [properties, initialData]);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    const value = form.value.trim() ? Number(form.value) : 0;
    if (form.value.trim() && (Number.isNaN(value) || value < 0)) {
      nextErrors.value = "Enter a valid value";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateDealData = {
      title: form.title.trim(),
      stage: form.stage || "lead",
      value: value,
      expected_close_date: form.expected_close_date || undefined,
      lead_id: form.lead_id || undefined,
      property_id: form.property_id || undefined,
      notes: form.notes.trim() || undefined,
    };

    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Deal" : "Add Deal"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Purchase of 123 Main St"
          error={errors.title}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Stage"
            value={form.stage}
            onChange={(e) => set("stage", e.target.value)}
            options={DEAL_STAGE_OPTIONS}
          />
          <Input
            label="Value (USD)"
            type="number"
            min={0}
            step="any"
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="500000"
            error={errors.value}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Lead"
            value={form.lead_id}
            onChange={(e) => set("lead_id", e.target.value)}
            options={leadOptions}
            placeholder="No lead"
          />
          <Select
            label="Property"
            value={form.property_id}
            onChange={(e) => set("property_id", e.target.value)}
            options={propertyOptions}
            placeholder="No property"
          />
        </div>
        <Input
          label="Expected close date"
          type="date"
          value={form.expected_close_date}
          onChange={(e) => set("expected_close_date", e.target.value)}
        />
        <Textarea
          label="Notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Any additional details..."
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
            {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Deal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
