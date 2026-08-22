import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  DollarSign,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { EmptyState } from "@/components/common/EmptyState";
import { PropertyFormModal } from "@/components/dashboard/forms/PropertyFormModal";
import { useProperties } from "@/hooks/useProperties";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { Property } from "@/types";

type PropertyStatus = "available" | "pending" | "sold" | "rented" | "off_market";
type ViewMode = "grid" | "table";

const statusConfig: Record<PropertyStatus, { label: string; variant: string }> = {
  available: { label: "Available", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  sold: { label: "Sold", variant: "default" },
  rented: { label: "Rented", variant: "info" },
  off_market: { label: "Off Market", variant: "danger" },
};

export function PropertiesPage() {
  const { currency, toggleCurrency } = useCurrencyStore();
  const {
    properties,
    isLoading,
    search,
    setSearch,
    error,
    create,
    update,
    remove,
    isSubmitting,
    submitError,
  } = useProperties();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);

  const propertyTypes = ["All", ...new Set(properties.map((p) => p.property_type))];

  const filtered = properties.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchType = typeFilter === "All" || p.property_type === typeFilter;
    return matchStatus && matchType;
  });

  const openAdd = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const openEdit = (prop: Property) => {
    setEditingProperty(prop);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Parameters<typeof create>[0]) => {
    if (editingProperty) {
      return update(editingProperty.id, data);
    }
    return create(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Properties</h1>
          <p className="text-sm text-dark-400 mt-1">{filtered.length} properties</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-200 hover:border-dark-600 transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            {currency === "USD" ? "$ USD" : "₹ INR"}
          </button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            {propertyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="hidden sm:flex items-center bg-dark-800 border border-dark-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-dark-700 text-gold-400" : "text-dark-400 hover:text-dark-200"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-dark-700 text-gold-400" : "text-dark-400 hover:text-dark-200"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-dark-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                  <div className="h-3 bg-dark-700 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                className="py-12"
                icon={<Home className="h-6 w-6" />}
                title={search ? "No properties match your search" : "No properties yet"}
                description={
                  search
                    ? "Try adjusting your search terms."
                    : "Add your first property to get started."
                }
              />
            </div>
          ) : (
            filtered.map((prop) => (
              <div key={prop.id} className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-dark-600 transition-all">
                <div className="relative h-48 overflow-hidden bg-dark-700">
                  {prop.images && prop.images.length > 0 ? (
                    <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-500">
                      <MapPin className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={(statusConfig[prop.status as PropertyStatus]?.variant || "default") as any}>
                      {statusConfig[prop.status as PropertyStatus]?.label || prop.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-xl font-bold text-white drop-shadow-lg">{formatAmount(prop.price, currency)}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-dark-100 truncate">{prop.title}</h3>
                  <div className="flex items-center gap-1 text-dark-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="text-xs truncate">{prop.city}, {prop.state} {prop.pincode}</span>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-dark-700/50">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5 text-dark-500" />
                      <span className="text-xs text-dark-300">{prop.bedrooms || 0} bd</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5 text-dark-500" />
                      <span className="text-xs text-dark-300">{prop.bathrooms || 0} ba</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-3.5 w-3.5 text-dark-500" />
                      <span className="text-xs text-dark-300">{(prop.area_sqft || 0).toLocaleString()} sqft</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-dark-700/50">
                    <button
                      onClick={() => openEdit(prop)}
                      className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                      title="Edit property"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingProperty(prop)}
                      className="p-1.5 rounded-md text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete property"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Beds/Baths</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Sqft</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                  : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4">
                          <EmptyState
                            className="py-10"
                            icon={<Home className="h-6 w-6" />}
                            title={search ? "No properties match your search" : "No properties yet"}
                            description={
                              search ? "Try adjusting your search terms." : undefined
                            }
                          />
                        </td>
                      </tr>
                    )
                  : filtered.map((prop) => (
                      <tr key={prop.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {prop.images && prop.images.length > 0 ? (
                              <img src={prop.images[0]} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="h-10 w-14 rounded-lg bg-dark-700 flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-dark-500" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark-100 truncate">{prop.title}</p>
                              <p className="text-xs text-dark-400 truncate">{prop.city}, {prop.state}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-dark-300">{prop.property_type}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-dark-300">{prop.bedrooms || 0} / {prop.bathrooms || 0}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-dark-300">{(prop.area_sqft || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gold-400">{formatAmount(prop.price, currency)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(statusConfig[prop.status as PropertyStatus]?.variant || "default") as any}>
                            {statusConfig[prop.status as PropertyStatus]?.label || prop.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(prop)}
                              className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                              title="Edit property"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingProperty(prop)}
                              className="p-1.5 rounded-md text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete property"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <PropertyFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProperty}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingProperty}
        onClose={() => setDeletingProperty(null)}
        onConfirm={() => (deletingProperty ? remove(deletingProperty.id) : Promise.resolve(false))}
        title="Delete Property"
        message={`Are you sure you want to delete ${deletingProperty ? `"${deletingProperty.title}"` : "this property"}? This action cannot be undone.`}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
