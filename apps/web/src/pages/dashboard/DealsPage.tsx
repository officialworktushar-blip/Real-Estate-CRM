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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CurrencyIcon,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { formatDate } from "@/utils/helpers";
import { formatAmount, type CurrencyCode } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";

type DealStage = "lead" | "proposal" | "negotiation" | "due_diligence" | "closing" | "closed_won";
type DealPriority = "high" | "medium" | "low";

const stages: DealStage[] = ["lead", "proposal", "negotiation", "due_diligence", "closing", "closed_won"];

const stageConfig: Record<DealStage, { label: string; color: string; bgColor: string; textColor: string }> = {
  lead: { label: "Lead", color: "border-dark-500", bgColor: "bg-dark-600", textColor: "text-dark-300" },
  proposal: { label: "Proposal", color: "border-blue-500", bgColor: "bg-blue-500", textColor: "text-blue-400" },
  negotiation: { label: "Negotiation", color: "border-amber-500", bgColor: "bg-amber-500", textColor: "text-amber-400" },
  due_diligence: { label: "Due Diligence", color: "border-purple-500", bgColor: "bg-purple-500", textColor: "text-purple-400" },
  closing: { label: "Closing", color: "border-emerald-500", bgColor: "bg-emerald-500", textColor: "text-emerald-400" },
  closed_won: { label: "Closed Won", color: "border-gold-500", bgColor: "bg-gold-500", textColor: "text-gold-400" },
};

const priorityConfig: Record<DealPriority, { label: string; variant: "danger" | "warning" | "default"; icon: React.ReactNode }> = {
  high: { label: "High", variant: "danger", icon: <AlertCircle className="h-3 w-3" /> },
  medium: { label: "Medium", variant: "warning", icon: <Clock className="h-3 w-3" /> },
  low: { label: "Low", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const initialDeals = [
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

export function DealsPage() {
  const { currency, toggleCurrency } = useCurrencyStore();
  const [deals, setDeals] = useState(initialDeals);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");

  const moveDeal = (dealId: string, direction: "forward" | "backward") => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        const idx = stages.indexOf(d.stage);
        if (direction === "forward" && idx < stages.length - 1) {
          return { ...d, stage: stages[idx + 1] };
        }
        if (direction === "backward" && idx > 0) {
          return { ...d, stage: stages[idx - 1] };
        }
        return d;
      })
    );
  };

  const filtered = deals.filter((d) => {
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
          <p className="text-sm text-dark-400 mt-1">{filtered.length} deals · {formatAmount(totalValue, currency)} pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-200 hover:border-dark-600 transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            {currency === "USD" ? "$ USD" : "₹ INR"}
          </button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
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
                <p className="text-lg font-bold text-dark-100">{formatAmount(totalValue, currency)}</p>
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
                <p className="text-lg font-bold text-gold-400">{formatAmount(totalCommission, currency)}</p>
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
          const stageIndex = stages.indexOf(stage);
          return (
            <div key={stage} className="min-w-[230px] space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stageConfig[stage].bgColor}`} />
                  <h4 className="text-sm font-semibold text-dark-200">{stageConfig[stage].label}</h4>
                </div>
                <span className="text-xs text-dark-500">{stageDeals.length} · {formatAmount(stageValue, currency)}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {stageDeals.map((deal) => {
                  const canGoForward = stageIndex < stages.length - 1;
                  const canGoBackward = stageIndex > 0;
                  return (
                    <div
                      key={deal.id}
                      className={`bg-dark-800 border border-dark-700 border-l-2 ${stageConfig[deal.stage].color} rounded-lg p-3 hover:border-dark-600 transition-colors`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-dark-100 truncate">{deal.title}</p>
                        <Badge variant={priorityConfig[deal.priority].variant}>
                          <span className="flex items-center gap-1">{priorityConfig[deal.priority].icon}{priorityConfig[deal.priority].label}</span>
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gold-400">{formatAmount(deal.value, currency)}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <User className="h-3 w-3 text-dark-500" />
                        <span className="text-xs text-dark-400 truncate">{deal.client}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-dark-500" />
                        <span className="text-[10px] text-dark-400">{formatDate(deal.expectedClose)}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-dark-700/50">
                        <button
                          onClick={() => canGoBackward && moveDeal(deal.id, "backward")}
                          disabled={!canGoBackward}
                          className="flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronLeft className="h-3 w-3" />
                          Back
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => canGoForward && moveDeal(deal.id, "forward")}
                          disabled={!canGoForward}
                          className={`flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                            canGoForward
                              ? stage === "closed_won" ? "text-dark-400 hover:text-dark-200 hover:bg-dark-700" : "text-gold-400 hover:text-gold-300 bg-gold-500/10 hover:bg-gold-500/20"
                              : "text-dark-400"
                          }`}
                        >
                          {canGoForward && stage !== "closed_won" ? "Advance" : "Done"}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
