import { useState } from "react";
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  User,
  MoreHorizontal,
  GripVertical,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { formatCurrency, formatDate } from "@/utils/helpers";

type DealStage = "lead" | "proposal" | "negotiation" | "due_diligence" | "closing" | "closed_won";
type DealPriority = "high" | "medium" | "low";

const dummyDeals = [
  { id: "1", title: "1234 Pacific Coast Hwy", stage: "negotiation" as DealStage, value: 2450000, commission: 73500, client: "Sarah Mitchell", expectedClose: "2026-08-15", priority: "high" as DealPriority },
  { id: "2", title: "567 Grand Ave #1201", stage: "proposal" as DealStage, value: 875000, commission: 26250, client: "James Rodriguez", expectedClose: "2026-08-30", priority: "medium" as DealPriority },
  { id: "3", title: "890 Oak Lane", stage: "closing" as DealStage, value: 1120000, commission: 33600, client: "Emily Chen", expectedClose: "2026-07-28", priority: "high" as DealPriority },
  { id: "4", title: "200 Ocean Ave #PH2", stage: "lead" as DealStage, value: 3200000, commission: 96000, client: "David Kim", expectedClose: "2026-09-15", priority: "low" as DealPriority },
  { id: "5", title: "789 Maple Dr", stage: "closed_won" as DealStage, value: 510000, commission: 15300, client: "Kevin Nguyen", expectedClose: "2026-07-20", priority: "medium" as DealPriority },
  { id: "6", title: "456 Oak Lane", stage: "due_diligence" as DealStage, value: 620000, commission: 18600, client: "Lisa Anderson", expectedClose: "2026-08-10", priority: "high" as DealPriority },
  { id: "7", title: "321 Traction Ave #LOFT", stage: "proposal" as DealStage, value: 695000, commission: 20850, client: "Carlos Gutierrez", expectedClose: "2026-09-01", priority: "low" as DealPriority },
  { id: "8", title: "555 Skyline Blvd", stage: "lead" as DealStage, value: 4800000, commission: 144000, client: "Robert Garcia", expectedClose: "2026-10-01", priority: "medium" as DealPriority },
  { id: "9", title: "123 Main St #B", stage: "negotiation" as DealStage, value: 780000, commission: 23400, client: "Amanda White", expectedClose: "2026-08-20", priority: "medium" as DealPriority },
  { id: "10", title: "456 Vermont Ave #305", stage: "proposal" as DealStage, value: 320000, commission: 9600, client: "Rachel Taylor", expectedClose: "2026-09-10", priority: "low" as DealPriority },
];

const stageConfig: Record<DealStage, { label: string; color: string; bgColor: string }> = {
  lead: { label: "Lead", color: "text-dark-300", bgColor: "bg-dark-600" },
  proposal: { label: "Proposal", color: "text-blue-400", bgColor: "bg-blue-500" },
  negotiation: { label: "Negotiation", color: "text-amber-400", bgColor: "bg-amber-500" },
  due_diligence: { label: "Due Diligence", color: "text-purple-400", bgColor: "bg-purple-500" },
  closing: { label: "Closing", color: "text-emerald-400", bgColor: "bg-emerald-500" },
  closed_won: { label: "Closed Won", color: "text-gold-400", bgColor: "bg-gold-500" },
};

const stages: DealStage[] = ["lead", "proposal", "negotiation", "due_diligence", "closing", "closed_won"];

const priorityConfig: Record<DealPriority, { label: string; variant: "danger" | "warning" | "default"; icon: React.ReactNode }> = {
  high: { label: "High", variant: "danger", icon: <AlertCircle className="h-3 w-3" /> },
  medium: { label: "Medium", variant: "warning", icon: <Clock className="h-3 w-3" /> },
  low: { label: "Low", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
};

export function DealsPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");

  const filtered = dummyDeals.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || d.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const totalValue = filtered.reduce((sum, d) => sum + d.value, 0);
  const totalCommission = filtered.reduce((sum, d) => sum + d.commission, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Deals</h1>
          <p className="text-sm text-dark-400 mt-1">{filtered.length} deals · {formatCurrency(totalValue)} pipeline</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Pipeline Value</p>
                <p className="text-lg font-bold text-dark-100">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-gold-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Expected Commission</p>
                <p className="text-lg font-bold text-gold-400">{formatCurrency(totalCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Closed This Month</p>
                <p className="text-lg font-bold text-dark-100">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as DealStage | "all")}
          className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
        >
          <option value="all">All Stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{stageConfig[s].label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto">
        {stages.map((stage) => {
          const stageDeals = filtered.filter((d) => d.stage === stage);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
          return (
            <div key={stage} className="min-w-[220px] space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stageConfig[stage].bgColor}`} />
                  <h4 className="text-sm font-semibold text-dark-200">{stageConfig[stage].label}</h4>
                </div>
                <span className="text-xs text-dark-500">{stageDeals.length} · {formatCurrency(stageValue)}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="bg-dark-800 border border-dark-700 rounded-lg p-3 hover:border-dark-600 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-dark-100 truncate">{deal.title}</p>
                      <GripVertical className="h-4 w-4 text-dark-600 shrink-0" />
                    </div>
                    <p className="text-lg font-bold text-gold-400 mt-1">{formatCurrency(deal.value)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <User className="h-3 w-3 text-dark-500" />
                      <span className="text-xs text-dark-400 truncate">{deal.client}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-700/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-dark-500" />
                        <span className="text-[10px] text-dark-400">{formatDate(deal.expectedClose)}</span>
                      </div>
                      <Badge variant={priorityConfig[deal.priority].variant}>
                        <span className="flex items-center gap-1">{priorityConfig[deal.priority].icon}{priorityConfig[deal.priority].label}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-dark-500 border border-dashed border-dark-700 rounded-lg">
                    No deals
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
