import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select, SelectOption } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import type { Client } from "@/types";
import type { CreateClientData } from "@/services/clients.service";

export const CLIENT_TYPE_OPTIONS: SelectOption[] = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "tenant", label: "Tenant" },
  { value: "landlord", label: "Landlord" },
  { value: "investor", label: "Investor" },
];

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientData) => Promise<boolean>;
  initialData?: Client | null;
  isSubmitting: boolean;
  submitError?: string | null;
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  type: string;
  notes: string;
}

const emptyState: FormState = {
  full_name: "",
  email: "",
  phone: "",
  type: "buyer",
  notes: "",
};

export function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  submitError,
}: ClientFormModalProps) {
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
              type: initialData.type || "buyer",
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
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateClientData = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      type: form.type || "buyer",
      notes: form.notes.trim() || undefined,
    };

    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Client" : "Add Client"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="e.g. John Doe"
          error={errors.full_name}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <Select
          label="Type"
          value={form.type}
          onChange={(e) => set("type", e.target.value)}
          options={CLIENT_TYPE_OPTIONS}
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
            {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
