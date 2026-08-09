import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select, SelectOption } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import type { Lead } from "@/types";
import type { CreateLeadData } from "@/services/leads.service";

export const LEAD_STATUS_OPTIONS: SelectOption[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "unqualified", label: "Unqualified" },
  { value: "converted", label: "Converted" },
];

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadData) => Promise<boolean>;
  initialData?: Lead | null;
  isSubmitting: boolean;
  submitError?: string | null;
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  budget: string;
  notes: string;
}

const emptyState: FormState = {
  full_name: "",
  email: "",
  phone: "",
  status: "new",
  source: "",
  budget: "",
  notes: "",
};

export function LeadFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  submitError,
}: LeadFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              full_name: initialData.full_name || "",
              email: initialData.email || "",
              phone: initialData.phone || "",
              status: initialData.status || "new",
              source: initialData.source || "",
              budget: initialData.budget != null ? String(initialData.budget) : "",
              notes: initialData.notes || "",
            }
          : emptyState
      );
      setErrors({});
    }
  }, [isOpen, initialData]);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.full_name.trim()) nextErrors.full_name = "Full name is required";
    if (form.budget.trim() && Number.isNaN(Number(form.budget))) {
      nextErrors.budget = "Budget must be a number";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateLeadData = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      status: form.status || "new",
      source: form.source.trim() || undefined,
      notes: form.notes.trim() || undefined,
      budget: form.budget.trim() ? Number(form.budget) : undefined,
    };

    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Lead" : "Add Lead"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="e.g. Jane Smith"
          error={errors.full_name}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@example.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            options={LEAD_STATUS_OPTIONS}
          />
          <Input
            label="Budget (USD)"
            type="number"
            min={0}
            step="any"
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
            placeholder="500000"
            error={errors.budget}
          />
        </div>
        <Input
          label="Source"
          value={form.source}
          onChange={(e) => set("source", e.target.value)}
          placeholder="e.g. website, referral, Zillow"
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
            {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
