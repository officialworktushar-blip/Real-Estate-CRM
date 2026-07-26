import { useState } from "react";
import {
  Search,
  CreditCard,
  Filter,
  MoreHorizontal,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";
import { formatDate } from "@/utils/helpers";

type SubStatus = "active" | "cancelled" | "past_due" | "trialing";
type SubPlan = "starter" | "professional" | "enterprise";
type BillingProvider = "stripe" | "razorpay";

const dummySubscriptions = [
  { id: "1", userName: "Alex Thompson", email: "alex@realty.com", plan: "professional" as SubPlan, status: "active" as SubStatus, provider: "stripe" as BillingProvider, amount: 49, startDate: "2026-01-15", nextBilling: "2026-08-15", country: "US" },
  { id: "2", userName: "Priya Sharma", email: "priya@homes.in", plan: "enterprise" as SubPlan, status: "active" as SubStatus, provider: "razorpay" as BillingProvider, amount: 149, startDate: "2026-02-20", nextBilling: "2026-08-20", country: "IN" },
  { id: "3", userName: "Marcus Johnson", email: "marcus@estate.com", plan: "starter" as SubPlan, status: "active" as SubStatus, provider: "stripe" as BillingProvider, amount: 19, startDate: "2026-03-10", nextBilling: "2026-08-10", country: "US" },
  { id: "4", userName: "Emma Wilson", email: "emma@prop.co", plan: "professional" as SubPlan, status: "trialing" as SubStatus, provider: "stripe" as BillingProvider, amount: 0, startDate: "2026-07-20", nextBilling: "2026-08-03", country: "GB" },
  { id: "5", userName: "Sofia Garcia", email: "sofia@realty.mx", plan: "starter" as SubPlan, status: "active" as SubStatus, provider: "stripe" as BillingProvider, amount: 19, startDate: "2026-04-05", nextBilling: "2026-08-05", country: "MX" },
  { id: "6", userName: "Tom Chen", email: "tom@homes.com", plan: "professional" as SubPlan, status: "active" as SubStatus, provider: "stripe" as BillingProvider, amount: 49, startDate: "2026-05-12", nextBilling: "2026-08-12", country: "US" },
  { id: "7", userName: "Aisha Khan", email: "aisha@estate.pk", plan: "starter" as SubPlan, status: "past_due" as SubStatus, provider: "razorpay" as BillingProvider, amount: 19, startDate: "2026-06-01", nextBilling: "2026-07-01", country: "PK" },
  { id: "8", userName: "David Lee", email: "david@property.com", plan: "enterprise" as SubPlan, status: "active" as SubStatus, provider: "stripe" as BillingProvider, amount: 149, startDate: "2025-12-15", nextBilling: "2026-08-15", country: "US" },
  { id: "9", userName: "Maria Rodriguez", email: "maria@realty.com", plan: "professional" as SubPlan, status: "cancelled" as SubStatus, provider: "stripe" as BillingProvider, amount: 49, startDate: "2026-01-28", nextBilling: "N/A", country: "ES" },
  { id: "10", userName: "Chen Wei", email: "chen@homes.cn", plan: "enterprise" as SubPlan, status: "active" as SubStatus, provider: "razorpay" as BillingProvider, amount: 149, startDate: "2026-03-22", nextBilling: "2026-08-22", country: "CN" },
  { id: "11", userName: "Nina Petrova", email: "nina@estate.ru", plan: "starter" as SubPlan, status: "cancelled" as SubStatus, provider: "stripe" as BillingProvider, amount: 19, startDate: "2026-05-18", nextBilling: "N/A", country: "RU" },
  { id: "12", userName: "Raj Patel", email: "raj@build.in", plan: "enterprise" as SubPlan, status: "active" as SubStatus, provider: "razorpay" as BillingProvider, amount: 149, startDate: "2025-11-01", nextBilling: "2026-08-01", country: "IN" },
];

const providerConfig: Record<BillingProvider, { label: string; color: string }> = {
  stripe: { label: "Stripe", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
  razorpay: { label: "Razorpay", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
};

const planConfig: Record<SubPlan, { label: string; variant: string; price: number }> = {
  starter: { label: "Starter", variant: "default", price: 19 },
  professional: { label: "Professional", variant: "info", price: 49 },
  enterprise: { label: "Enterprise", variant: "warning", price: 149 },
};

const statusConfig: Record<SubStatus, { label: string; variant: string; icon: React.ReactNode }> = {
  active: { label: "Active", variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", variant: "danger", icon: <XCircle className="h-3 w-3" /> },
  past_due: { label: "Past Due", variant: "danger", icon: <AlertCircle className="h-3 w-3" /> },
  trialing: { label: "Trial", variant: "warning", icon: <Clock className="h-3 w-3" /> },
};

export function SubscriptionsPage() {
  const { currency } = useCurrencyStore();
  const [isLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<SubPlan | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SubStatus | "all">("all");
  const [providerFilter, setProviderFilter] = useState<BillingProvider | "all">("all");

  const filtered = dummySubscriptions.filter((s) => {
    const matchSearch =
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || s.plan === planFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchProvider = providerFilter === "all" || s.provider === providerFilter;
    return matchSearch && matchPlan && matchStatus && matchProvider;
  });

  const mrr = filtered
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);

  const activeCount = filtered.filter((s) => s.status === "active").length;
  const trialCount = filtered.filter((s) => s.status === "trialing").length;
  const pastDueCount = filtered.filter((s) => s.status === "past_due").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Subscriptions</h1>
          <p className="text-sm text-dark-400 mt-1">{filtered.length} total subscriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{activeCount}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{trialCount}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Trials</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-400">{pastDueCount}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Past Due</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-gold-400">{formatAmount(mrr, currency)}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">MRR</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as SubPlan | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Plans</option>
            {Object.entries(planConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SubStatus | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as BillingProvider | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Providers</option>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Next Billing</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dark-100 truncate">{sub.userName}</p>
                          <p className="text-xs text-dark-400 truncate">{sub.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={planConfig[sub.plan].variant as any}>{planConfig[sub.plan].label}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${providerConfig[sub.provider].color}`}>
                          {providerConfig[sub.provider].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm font-semibold text-dark-200">
                          {sub.amount === 0 ? "Free" : `${formatAmount(sub.amount, currency)}/mo`}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-dark-400">{sub.nextBilling}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig[sub.status].variant as any}>
                          <span className="flex items-center gap-1">{statusConfig[sub.status].icon}{statusConfig[sub.status].label}</span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
