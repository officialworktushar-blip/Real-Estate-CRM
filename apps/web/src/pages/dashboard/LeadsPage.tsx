import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  Star,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { formatCurrency, formatDate } from "@/utils/helpers";

type LeadStatus = "new" | "contacted" | "qualified" | "negotiation" | "closed" | "lost";
type ViewMode = "table" | "kanban";

const dummyLeads = [
  { id: "1", name: "Sarah Mitchell", email: "sarah.m@email.com", phone: "(310) 555-0142", source: "Website", status: "new" as LeadStatus, budget: 450000, location: "Beverly Hills", interest: "Single Family", rating: 4, created_at: "2026-07-25", notes: "Looking for 3+ bed, prefers modern style" },
  { id: "2", name: "James Rodriguez", email: "james.r@email.com", phone: "(213) 555-0198", source: "Referral", status: "qualified" as LeadStatus, budget: 720000, location: "Santa Monica", interest: "Condo", rating: 5, created_at: "2026-07-24", notes: "Pre-approved for $750K, wants ocean view" },
  { id: "3", name: "Emily Chen", email: "emily.c@email.com", phone: "(424) 555-0211", source: "Zillow", status: "contacted" as LeadStatus, budget: 380000, location: "Pasadena", interest: "Townhouse", rating: 3, created_at: "2026-07-23", notes: "First-time buyer, needs guidance on process" },
  { id: "4", name: "Michael Brown", email: "michael.b@email.com", phone: "(323) 555-0177", source: "Social Media", status: "new" as LeadStatus, budget: 550000, location: "West Hollywood", interest: "Condo", rating: 3, created_at: "2026-07-22", notes: "Inquired via Instagram DM" },
  { id: "5", name: "Lisa Anderson", email: "lisa.a@email.com", phone: "(818) 555-0133", source: "Open House", status: "negotiation" as LeadStatus, budget: 620000, location: "Glendale", interest: "Single Family", rating: 5, created_at: "2026-07-21", notes: "Very interested in 456 Oak Lane, wants to negotiate price" },
  { id: "6", name: "David Kim", email: "david.k@email.com", phone: "(310) 555-0155", source: "Website", status: "qualified" as LeadStatus, budget: 890000, location: "Manhattan Beach", interest: "Single Family", rating: 4, created_at: "2026-07-20", notes: "Relocating from Seattle, needs quick timeline" },
  { id: "7", name: "Rachel Taylor", email: "rachel.t@email.com", phone: "(213) 555-0188", source: "Referral", status: "contacted" as LeadStatus, budget: 320000, location: "Koreatown", interest: "Condo", rating: 3, created_at: "2026-07-19", notes: "Investment property, looking for rental yield" },
  { id: "8", name: "Carlos Gutierrez", email: "carlos.g@email.com", phone: "(424) 555-0166", source: "Social Media", status: "new" as LeadStatus, budget: 475000, location: "Echo Park", interest: "Townhouse", rating: 4, created_at: "2026-07-18", notes: "Saw our TikTok, wants modern loft-style" },
  { id: "9", name: "Amanda White", email: "amanda.w@email.com", phone: "(323) 555-0144", source: "Zillow", status: "lost" as LeadStatus, budget: 290000, location: "Silver Lake", interest: "Studio", rating: 2, created_at: "2026-07-17", notes: "Went with another agent" },
  { id: "10", name: "Kevin Nguyen", email: "kevin.n@email.com", phone: "(818) 555-0122", source: "Open House", status: "closed" as LeadStatus, budget: 510000, location: "Burbank", interest: "Condo", rating: 5, created_at: "2026-07-15", notes: "Successfully closed on 789 Maple Dr" },
  { id: "11", name: "Jennifer Lee", email: "jennifer.l@email.com", phone: "(310) 555-0199", source: "Website", status: "new" as LeadStatus, budget: 680000, location: "Venice", interest: "Single Family", rating: 4, created_at: "2026-07-26", notes: "Looking for beach proximity" },
  { id: "12", name: "Robert Garcia", email: "robert.g@email.com", phone: "(213) 555-0155", source: "Referral", status: "qualified" as LeadStatus, budget: 950000, location: "Malibu", interest: "Single Family", rating: 5, created_at: "2026-07-25", notes: "Cash buyer, looking for luxury property" },
];

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
  const [isLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filteredLeads = dummyLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                  : filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gold-500/10 flex items-center justify-center text-sm font-semibold text-gold-400 shrink-0">
                              {lead.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark-100 truncate">{lead.name}</p>
                              <p className="text-xs text-dark-400 truncate">{lead.interest}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-xs text-dark-300 truncate max-w-[180px]">{lead.email}</p>
                            <p className="text-xs text-dark-400">{lead.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-dark-500" />
                            <span className="text-sm text-dark-300">{lead.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm font-medium text-dark-200">{formatCurrency(lead.budget)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusConfig[lead.status].variant as any}>{statusConfig[lead.status].label}</Badge>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-sm text-dark-400">{lead.source}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                              <Phone className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                              <Mail className="h-4 w-4" />
                            </button>
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
                      <p className="text-sm font-medium text-dark-100 truncate">{lead.name}</p>
                      <p className="text-xs text-dark-400 mt-1">{lead.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-gold-400">{formatCurrency(lead.budget)}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: lead.rating }).map((_, i) => (
                            <Star key={i} className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-dark-500 mt-2 truncate">{lead.notes}</p>
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
