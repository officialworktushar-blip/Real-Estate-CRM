import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select, SelectOption } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import type { Property } from "@/types";
import type { CreatePropertyData } from "@/services/properties.service";

export const PROPERTY_TYPE_OPTIONS: SelectOption[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

export const PROPERTY_STATUS_OPTIONS: SelectOption[] = [
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "off_market", label: "Off Market" },
];

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePropertyData) => Promise<boolean>;
  initialData?: Property | null;
  isSubmitting: boolean;
  submitError?: string | null;
}

interface FormState {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  property_type: string;
  status: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area_sqft: string;
}

const emptyState: FormState = {
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "US",
  property_type: "house",
  status: "available",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area_sqft: "",
};

export function PropertyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  submitError,
}: PropertyFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              title: initialData.title || "",
              description: initialData.description || "",
              address: initialData.address || "",
              city: initialData.city || "",
              state: initialData.state || "",
              pincode: initialData.pincode || "",
              country: initialData.country || "US",
              property_type: initialData.property_type || "house",
              status: initialData.status || "available",
              price: initialData.price != null ? String(initialData.price) : "",
              bedrooms: initialData.bedrooms != null ? String(initialData.bedrooms) : "",
              bathrooms: initialData.bathrooms != null ? String(initialData.bathrooms) : "",
              area_sqft: initialData.area_sqft != null ? String(initialData.area_sqft) : "",
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
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.address.trim()) nextErrors.address = "Address is required";
    if (!form.city.trim()) nextErrors.city = "City is required";
    if (!form.state.trim()) nextErrors.state = "State is required";
    if (!form.pincode.trim()) nextErrors.pincode = "Pincode is required";
    const price = form.price.trim() ? Number(form.price) : Number.NaN;
    if (!form.price.trim() || Number.isNaN(price) || price <= 0) {
      nextErrors.price = "Price is required";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreatePropertyData = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      country: form.country.trim() || "US",
      property_type: form.property_type || "house",
      status: form.status || "available",
      price,
      bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms.trim() ? Number(form.bathrooms) : undefined,
      area_sqft: form.area_sqft.trim() ? Number(form.area_sqft) : undefined,
    };

    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Property" : "Add Property"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Modern 3BR in Uptown"
          error={errors.title}
          required
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="Short description of the property..."
        />
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="123 Main Street"
          error={errors.address}
          required
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="City"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            error={errors.city}
            required
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            error={errors.state}
            required
          />
          <Input
            label="Pincode"
            value={form.pincode}
            onChange={(e) => set("pincode", e.target.value)}
            error={errors.pincode}
            required
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="US"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Type"
            value={form.property_type}
            onChange={(e) => set("property_type", e.target.value)}
            options={PROPERTY_TYPE_OPTIONS}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            options={PROPERTY_STATUS_OPTIONS}
          />
          <Input
            label="Price (USD)"
            type="number"
            min={0}
            step="any"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="450000"
            error={errors.price}
            required
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Input
            label="Bedrooms"
            type="number"
            min={0}
            step={1}
            value={form.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
            placeholder="3"
          />
          <Input
            label="Bathrooms"
            type="number"
            min={0}
            step="any"
            value={form.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
            placeholder="2.5"
          />
          <Input
            label="Area (sq ft)"
            type="number"
            min={0}
            step="any"
            value={form.area_sqft}
            onChange={(e) => set("area_sqft", e.target.value)}
            placeholder="2100"
          />
        </div>
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
            {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Property"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
