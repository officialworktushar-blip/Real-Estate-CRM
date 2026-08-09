import { useState } from "react";
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { DealFormModal } from "@/components/dashboard/forms/DealFormModal";
import { useDeals } from "@/hooks/useDeals";
import { useLeads } from "@/hooks/useLeads";
import { useProperties } from "@/hooks/useProperties";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { Deal } from "@/types";

type DealStage = "lead" | "proposal" | "negotiation" | "contract" | "closed_won" | "closed_lost";
type DealPriority = "high" | "medium" | "low";

const stages: DealStage[] = ["lead", "proposal", "negotiation", "contract", "closed_won", "closed_lost"];

const stageConfig: Record<DealStage, { label: string; color: string; bgColor: string; textColor: string }> = {
  lead: { label: "Lead", color: "border-dark-500", bgColor: "bg-dark-600", textColor: "text-dark-300" },
  proposal: { label: "Proposal", color: "border-blue-500", bgColor: "bg-blue-500", textColor: "text-blue-400" },
  negotiation: { label: "Negotiation", color: "border-amber-500", bgColor: "bg-amber-500", textColor: "text-amber-400" },
  contract: { label: "Contract", color: "border-purple-500", bgColor: "bg-purple-500", textColor: "text-purple-400" },
  closed_won: { label: "Closed Won", color: "border-emerald-500", bgColor: "bg-emerald-500", textColor: "text-emerald-400" },
  closed_lost: { label: "Closed Lost", color: "border-red-500", bgColor: "bg-red-500", textColor: "text-red-400" },
};

const priorityConfig: Record<DealPriority, { label: string; variant: "danger" | "warning" | "default"; icon: React.ReactNode }> = {
  high: { label: "High", variant: "danger", icon: <AlertCircle className="h-3 w-3" /> },
  medium: { label: "Medium", variant: "warning", icon: <Clock className="h-3 w-3" /> },
  low: { label: "Low", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
};

export function DealsPage() {
  const { currency, toggleCurrency } = useCurrencyStore();
  const {
    deals,
    isLoading,
    search,
    setSearch,
    stage,
    setStage,
    updateDealStage,
    error,
    create,
    update,
    remove,
    isSubmitting,
    submitError,
  } = useDeals();
  const { leads } = useLeads();
  const { properties } = useProperties();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const filtered = deals.filter((d) => {
    const matchStage = stage === "" || stage === "all" || d.stage === stage;
    return matchStage;
  });

  const totalValue = filtered.reduce((sum, d) => sum + (d.value || 0), 0);

  const getDealClientName = (deal: Deal) => {
    if (deal.leads?.full_name) return deal.leads.full_name;
    return "Unassigned";
  };

  const openAdd = () => {
    setEditingDeal(null);
    setIsFormOpen(true);
  };

  const openEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Parameters<typeof create>[0]) => {
    if (editingDeal) {
      return update(editingDeal.id, data);
    }
    return create(data);
  };

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
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

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
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Closed Deals</p>
                <p className="text-lg font-bold text-dark-100">{filtered.filter((d) => d.stage === "closed_won").length}</p>
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
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
        >
          <option value="all">All Stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{stageConfig[s].label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          {stages.map((s) => (
            <div key={s} className="min-w-[230px] space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className={`h-2 w-2 rounded-full ${stageConfig[s].bgColor}`} />
                <h4 className="text-sm font-semibold text-dark-200">{stageConfig[s].label}</h4>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-dark-800 border border-dark-700 rounded-lg p-3 animate-pulse">
                    <div className="h-4 bg-dark-700 rounded w-3/4 mb-2" />
                    <div className="h-6 bg-dark-700 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-dark-700 rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto">
          {stages.map((stageItem) => {
            const stageDeals = filtered.filter((d) => d.stage === stageItem);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const stageIndex = stages.indexOf(stageItem);
            return (
              <div key={stageItem} className="min-w-[230px] space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${stageConfig[stageItem].bgColor}`} />
                    <h4 className="text-sm font-semibold text-dark-200">{stageConfig[stageItem].label}</h4>
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
                        className={`bg-dark-800 border border-dark-700 border-l-2 ${stageConfig[deal.stage as DealStage]?.color || "border-dark-500"} rounded-lg p-3 hover:border-dark-600 transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-dark-100 truncate">{deal.title}</p>
                          <button
                            onClick={() => setDeletingDeal(deal)}
                            className="p-1 rounded text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                            title="Delete deal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-lg font-bold text-gold-400">{formatAmount(deal.value || 0, currency)}</span>
                        </div>

                        <div className="flex items-center gap-1 mt-2">
                          <User className="h-3 w-3 text-dark-500" />
                          <span className="text-xs text-dark-400 truncate">{getDealClientName(deal)}</span>
                        </div>

                        {deal.expected_close_date && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-dark-500" />
                            <span className="text-[10px] text-dark-400">{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-dark-700/50">
                          <button
                            onClick={() => canGoBackward && updateDealStage(deal.id, stages[stageIndex - 1])}
                            disabled={!canGoBackward}
                            className="flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronLeft className="h-3 w-3" />
                            Back
                          </button>
                          <div className="flex-1" />
                          <button
                            onClick={() => canGoForward && updateDealStage(deal.id, stages[stageIndex + 1])}
                            disabled={!canGoForward}
                            className={`flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                              canGoForward
                                ? stageItem === "closed_won" ? "text-dark-400 hover:text-dark-200 hover:bg-dark-700" : "text-gold-400 hover:text-gold-300 bg-gold-500/10 hover:bg-gold-500/20"
                                : "text-dark-400"
                            }`}
                          >
                            {canGoForward && stageItem !== "closed_won" ? "Advance" : "Done"}
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
      )}

      <DealFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingDeal}
        leads={leads}
        properties={properties}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingDeal}
        onClose={() => setDeletingDeal(null)}
        onConfirm={() => (deletingDeal ? remove(deletingDeal.id) : Promise.resolve(false))}
        title="Delete Deal"
        message={`Are you sure you want to delete ${deletingDeal ? `"${deletingDeal.title}"` : "this deal"}? This action cannot be undone.`}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
