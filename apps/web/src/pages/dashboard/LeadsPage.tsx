import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Phone,
  Mail,
  Pencil,
  Trash2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { LeadFormModal } from "@/components/dashboard/forms/LeadFormModal";
import { useLeads } from "@/hooks/useLeads";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { Lead } from "@/types";

type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";
type ViewMode = "table" | "kanban";

const statusConfig: Record<LeadStatus, { label: string; variant: string }> = {
  new: { label: "New", variant: "info" },
  contacted: { label: "Contacted", variant: "warning" },
  qualified: { label: "Qualified", variant: "success" },
  unqualified: { label: "Unqualified", variant: "danger" },
  converted: { label: "Converted", variant: "success" },
};

const kanbanColumns: LeadStatus[] = ["new", "contacted", "qualified", "unqualified", "converted"];

export function LeadsPage() {
  const { currency, toggleCurrency } = useCurrencyStore();
  const {
    leads,
    isLoading,
    search,
    setSearch,
    error,
    create,
    update,
    remove,
    isSubmitting,
    submitError,
  } = useLeads();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesStatus;
  });

  const getLeadName = (lead: Lead) => lead.full_name;

  const openAdd = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Parameters<typeof create>[0]) => {
    if (editingLead) {
      return update(editingLead.id, data);
    }
    return create(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Leads</h1>
          <p className="text-sm text-dark-400 mt-1">{filteredLeads.length} total leads</p>
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
            Add Lead
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
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Status</option>
            {kanbanColumns.map((s) => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <div className="hidden sm:flex items-center bg-dark-800 border border-dark-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-dark-700 text-gold-400" : "text-dark-400 hover:text-dark-200"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "kanban" ? "bg-dark-700 text-gold-400" : "text-dark-400 hover:text-dark-200"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Source</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                  : filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-dark-500 text-sm">
                          {search ? "No leads match your search." : "No leads yet. Add your first lead to get started."}
                        </td>
                      </tr>
                    )
                  : filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gold-500/10 flex items-center justify-center text-sm font-semibold text-gold-400 shrink-0">
                              {getLeadName(lead).charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark-100 truncate">{getLeadName(lead)}</p>
                              <p className="text-xs text-dark-400 truncate">{lead.source || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-xs text-dark-300 truncate max-w-[180px]">{lead.email || "—"}</p>
                            <p className="text-xs text-dark-400">{lead.phone || "—"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm font-medium text-dark-200">
                            {lead.budget ? formatAmount(lead.budget, currency) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(statusConfig[lead.status as LeadStatus]?.variant || "default") as any}>
                            {statusConfig[lead.status as LeadStatus]?.label || lead.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-sm text-dark-400">{lead.source || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            )}
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                              >
                                <Mail className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => openEdit(lead)}
                              className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                              title="Edit lead"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingLead(lead)}
                              className="p-1.5 rounded-md text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete lead"
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kanbanColumns.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col);
            return (
              <div key={col} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-dark-200">{statusConfig[col].label}</h4>
                    <span className="text-xs text-dark-500 bg-dark-800 px-1.5 py-0.5 rounded-full">{colLeads.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {colLeads.map((lead) => (
                    <div key={lead.id} className="bg-dark-800 border border-dark-700 rounded-lg p-3 hover:border-dark-600 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-dark-100 truncate">{getLeadName(lead)}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(lead)}
                            className="p-1 rounded text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                            title="Edit lead"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingLead(lead)}
                            className="p-1 rounded text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-dark-400 mt-1">{lead.source || "—"}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-gold-400">
                          {lead.budget ? formatAmount(lead.budget, currency) : "—"}
                        </span>
                      </div>
                      {lead.notes && (
                        <p className="text-[10px] text-dark-500 mt-2 truncate">{lead.notes}</p>
                      )}
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-xs text-dark-500 border border-dashed border-dark-700 rounded-lg">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingLead}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={() => (deletingLead ? remove(deletingLead.id) : Promise.resolve(false))}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deletingLead ? `"${deletingLead.full_name}"` : "this lead"}? This action cannot be undone.`}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
