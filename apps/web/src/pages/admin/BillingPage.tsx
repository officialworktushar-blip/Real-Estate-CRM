import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Download,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { useAdminBilling } from "@/hooks/useAdmin";
import { formatInr } from "@/utils/currency";

const paymentStatusConfig: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  succeeded: { label: "Paid", variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { label: "Failed", variant: "danger", icon: <XCircle className="h-3 w-3" /> },
  refunded: { label: "Refunded", variant: "warning", icon: <XCircle className="h-3 w-3" /> },
  pending: { label: "Pending", variant: "default", icon: <XCircle className="h-3 w-3" /> },
  created: { label: "Created", variant: "default", icon: <XCircle className="h-3 w-3" /> },
};

export function BillingPage() {
  const { records, revenue, isLoading, error } = useAdminBilling();

  const totalRevenue = revenue.reduce((sum, m) => sum + m.total, 0);
  const succeededPayments = records.filter((r) => r.status === "succeeded").length;
  const failedPayments = records.filter((r) => r.status === "failed").length;
  const latestMonth = revenue.length > 0 ? revenue[revenue.length - 1] : null;

  const billingStats: { title: string; value: string | number; change: string; changeType: "positive" | "negative" | "neutral"; icon: React.ReactNode }[] = [
    { title: "Total Revenue (YTD)", value: formatInr(totalRevenue), change: `${revenue.length} months`, changeType: "positive", icon: <DollarSign className="h-6 w-6" /> },
    { title: "Monthly Revenue", value: latestMonth ? formatInr(latestMonth.total) : "—", change: "Latest month", changeType: "positive", icon: <TrendingUp className="h-6 w-6" /> },
    { title: "Successful Payments", value: `${succeededPayments}`, change: `${records.length} total`, changeType: "positive", icon: <CheckCircle2 className="h-6 w-6" /> },
    { title: "Failed Payments", value: `${failedPayments}`, change: "Needs attention", changeType: failedPayments > 0 ? "negative" : "neutral", icon: <XCircle className="h-6 w-6" /> },
  ];

  const maxRevenue = Math.max(...revenue.map((m) => m.total), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Billing</h1>
          <p className="text-sm text-dark-400 mt-1">Revenue overview and payment history</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          : billingStats.map((stat) => <StatsCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">Revenue Overview</h3>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>{revenue.length} months</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-end gap-2 h-48">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 animate-pulse">
                      <div className="bg-dark-700 rounded-t-md" style={{ height: `${Math.random() * 120 + 20}px` }} />
                    </div>
                  ))}
                </div>
              ) : revenue.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-dark-500 text-sm">No revenue data yet</div>
              ) : (
                <div className="flex items-end gap-2 h-48">
                  {revenue.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-dark-400">{formatInr(m.total)}</span>
                      <div className="w-full bg-gold-500/20 rounded-t-md relative" style={{ height: `${(m.total / maxRevenue) * 140}px` }}>
                        <div className="absolute inset-0 bg-gold-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs text-dark-400">{m.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Revenue by Provider</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="flex justify-between"><div className="h-3 bg-dark-700 rounded w-24" /><div className="h-3 bg-dark-700 rounded w-16" /></div>
                      <div className="h-2 bg-dark-700 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {(() => {
                    const stripeTotal = revenue.reduce((sum, m) => sum + m.stripe, 0);
                    const razorpayTotal = revenue.reduce((sum, m) => sum + m.razorpay, 0);
                    const grandTotal = stripeTotal + razorpayTotal || 1;
                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-dark-200">Stripe Revenue</span>
                            <span className="text-sm font-semibold text-gold-400">{formatInr(stripeTotal)}</span>
                          </div>
                          <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${(stripeTotal / grandTotal) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-dark-500">{Math.round((stripeTotal / grandTotal) * 100)}%</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-dark-200">Razorpay Revenue</span>
                            <span className="text-sm font-semibold text-gold-400">{formatInr(razorpayTotal)}</span>
                          </div>
                          <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${(razorpayTotal / grandTotal) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-dark-500">{Math.round((razorpayTotal / grandTotal) * 100)}%</span>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-dark-100">Recent Payments</h3>
            <Button variant="ghost" size="sm">
              <Receipt className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Organization</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="animate-pulse flex items-center gap-3">
                        <div className="h-8 w-8 bg-dark-700 rounded" />
                        <div className="space-y-1 flex-1">
                          <div className="h-3 bg-dark-700 rounded w-32" />
                          <div className="h-2 bg-dark-700 rounded w-24" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-dark-500 text-sm">
                    No payment records yet.
                  </td>
                </tr>
              ) : (
                records.map((payment) => (
                  <tr key={payment.id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-100 truncate">{payment.organizations?.name || "Unknown"}</p>
                        <p className="text-xs text-dark-400 truncate">{payment.plan ? `${payment.plan} plan` : ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant={payment.billing_provider === "razorpay" ? "info" : "warning"}>
                        {payment.billing_provider || "razorpay"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${
                        payment.status === "refunded" ? "text-amber-400" : payment.status === "failed" ? "text-red-400" : "text-emerald-400"
                      }`}>
                        {payment.status === "refunded" ? "-" : ""}{formatInr(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-dark-400">{new Date(payment.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={(paymentStatusConfig[payment.status]?.variant || "default") as any}>
                        <span className="flex items-center gap-1">
                          {paymentStatusConfig[payment.status]?.icon}
                          {paymentStatusConfig[payment.status]?.label || payment.status}
                        </span>
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
