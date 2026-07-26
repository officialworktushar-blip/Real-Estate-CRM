import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { useLeads } from "@/hooks/useLeads";

type LeadStatus = "new" | "contacted" | "qualified" | "negotiation" | "closed" | "lost";
type ViewMode = "table" | "kanban";

const statusConfig: Record<LeadStatus, { label: string; variant: string }> = {
  new: { label: "New", variant: "info" },
  contacted: { label: "Contacted", variant: "warning" },
  qualified: { label: "Qualified", variant: "success" },
  negotiation: { label: "Negotiation", variant: "default" },
  closed: { label: "Closed", variant: "success" },
  lost: { label: "Lost", variant: "danger" },
};

const kanbanColumns: LeadStatus[] = ["new", "contacted", "qualified", "negotiation", "closed", "lost"];

export function LeadsPage() {
  const { leads, isLoading, search, setSearch, error } = useLeads();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesStatus;
  });

  const getLeadName = (lead: typeof leads[0]) => `${lead.first_name} ${lead.last_name}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Leads</h1>
          <p className="text-sm text-dark-400 mt-1">{filteredLeads.length} total leads</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Source</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                  : filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-dark-500 text-sm">
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
                              <p className="text-xs text-dark-400 truncate">{lead.preferred_location || lead.source}</p>
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
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-dark-500" />
                            <span className="text-sm text-dark-300">{lead.preferred_location || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm font-medium text-dark-200">
                            {lead.budget_min || lead.budget_max ? `$${(lead.budget_min || 0).toLocaleString()} - $${(lead.budget_max || 0).toLocaleString()}` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(statusConfig[lead.status as LeadStatus]?.variant || "default") as any}>
                            {statusConfig[lead.status as LeadStatus]?.label || lead.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-sm text-dark-400">{lead.source}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {lead.phone && (
                              <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                                <Phone className="h-4 w-4" />
                              </button>
                            )}
                            {lead.email && (
                              <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                                <Mail className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                    <div key={lead.id} className="bg-dark-800 border border-dark-700 rounded-lg p-3 hover:border-dark-600 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-dark-100 truncate">{getLeadName(lead)}</p>
                      <p className="text-xs text-dark-400 mt-1">{lead.preferred_location || lead.source}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-gold-400">
                          {lead.budget_max ? `$${lead.budget_max.toLocaleString()}` : "—"}
                        </span>
                      </div>
                      {lead.notes && (
                        <p className="text-[10px] text-dark-500 mt-2 truncate">{lead.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
