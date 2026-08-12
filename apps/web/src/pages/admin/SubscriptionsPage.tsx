import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { useAdminSubscriptions } from "@/hooks/useAdmin";
import { formatInr } from "@/utils/currency";

type SubStatus = "active" | "cancelled" | "past_due" | "trialing";

const statusConfig: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  active: { label: "Active", variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", variant: "danger", icon: <XCircle className="h-3 w-3" /> },
  past_due: { label: "Past Due", variant: "danger", icon: <AlertCircle className="h-3 w-3" /> },
  trialing: { label: "Trial", variant: "warning", icon: <Clock className="h-3 w-3" /> },
};

export function SubscriptionsPage() {
  const { subscriptions, stats, isLoading, error } = useAdminSubscriptions();

  const activeCount = stats?.active || 0;
  const trialCount = stats?.trialing || 0;
  const pastDueCount = stats?.past_due || 0;
  const mrr = stats?.mrr || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Subscriptions</h1>
          <p className="text-sm text-dark-400 mt-1">{subscriptions.length} total subscriptions</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

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
            <p className="text-lg font-bold text-gold-400">{formatInr(mrr)}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">MRR</p>
          </CardContent>
        </Card>
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
                : subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-dark-500 text-sm">
                        No subscriptions found.
                      </td>
                    </tr>
                  )
                  : subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate">{sub.profiles?.full_name || "Unknown"}</p>
                            <p className="text-xs text-dark-400 truncate">{sub.profiles?.email || ""}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={sub.plan === "agency" ? "warning" : sub.plan === "growth" ? "info" : "default"}>
                            {sub.plan}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            sub.billing_provider === "razorpay"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {sub.billing_provider || "stripe"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm font-semibold text-dark-200">
                            {sub.amount ? `${formatInr(sub.amount)}/mo` : "Free"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-dark-400">
                            {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(statusConfig[sub.status]?.variant || "default") as any}>
                            <span className="flex items-center gap-1">
                              {statusConfig[sub.status]?.icon}
                              {statusConfig[sub.status]?.label || sub.status}
                            </span>
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
