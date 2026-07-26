import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";

const monthlyRevenue = [
  { month: "Jan", value: 98000 },
  { month: "Feb", value: 105000 },
  { month: "Mar", value: 112000 },
  { month: "Apr", value: 98000 },
  { month: "May", value: 118000 },
  { month: "Jun", value: 122000 },
  { month: "Jul", value: 128450 },
];

const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));

const recentPayments = [
  { id: "1", user: "Alex Thompson", email: "alex@realty.com", amount: 49, plan: "Professional", provider: "Stripe", status: "succeeded", date: "2026-07-25", invoiceId: "INV-2026-001" },
  { id: "2", user: "Priya Sharma", email: "priya@homes.in", amount: 149, plan: "Enterprise", provider: "Razorpay", status: "succeeded", date: "2026-07-24", invoiceId: "INV-2026-002" },
  { id: "3", user: "Marcus Johnson", email: "marcus@estate.com", amount: 19, plan: "Starter", provider: "Stripe", status: "succeeded", date: "2026-07-24", invoiceId: "INV-2026-003" },
  { id: "4", user: "Aisha Khan", email: "aisha@estate.pk", amount: 19, plan: "Starter", provider: "Razorpay", status: "failed", date: "2026-07-23", invoiceId: "INV-2026-004" },
  { id: "5", user: "David Lee", email: "david@property.com", amount: 149, plan: "Enterprise", provider: "Stripe", status: "succeeded", date: "2026-07-22", invoiceId: "INV-2026-005" },
  { id: "6", user: "Tom Chen", email: "tom@homes.com", amount: 49, plan: "Professional", provider: "Stripe", status: "succeeded", date: "2026-07-21", invoiceId: "INV-2026-006" },
  { id: "7", user: "Sofia Garcia", email: "sofia@realty.mx", amount: 19, plan: "Starter", provider: "Stripe", status: "refunded", date: "2026-07-20", invoiceId: "INV-2026-007" },
  { id: "8", user: "Chen Wei", email: "chen@homes.cn", amount: 149, plan: "Enterprise", provider: "Razorpay", status: "succeeded", date: "2026-07-19", invoiceId: "INV-2026-008" },
  { id: "9", user: "Maria Rodriguez", email: "maria@realty.com", amount: 49, plan: "Professional", provider: "Stripe", status: "succeeded", date: "2026-07-18", invoiceId: "INV-2026-009" },
  { id: "10", user: "Raj Patel", email: "raj@build.in", amount: 149, plan: "Enterprise", provider: "Razorpay", status: "succeeded", date: "2026-07-17", invoiceId: "INV-2026-010" },
];

const paymentStatusConfig: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  succeeded: { label: "Paid", variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { label: "Failed", variant: "danger", icon: <XCircle className="h-3 w-3" /> },
  refunded: { label: "Refunded", variant: "warning", icon: <ArrowDownRight className="h-3 w-3" /> },
  pending: { label: "Pending", variant: "default", icon: <Clock className="h-3 w-3" /> },
};

export function BillingPage() {
  const { currency } = useCurrencyStore();
  const [isLoading] = useState(false);
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.value, 0);
  const succeededPayments = recentPayments.filter((p) => p.status === "succeeded").length;
  const failedPayments = recentPayments.filter((p) => p.status === "failed").length;

  const billingStats: { title: string; value: string | number; change: string; changeType: "positive" | "negative" | "neutral"; icon: React.ReactNode }[] = [
    { title: "Total Revenue (YTD)", value: formatAmount(totalRevenue, currency), change: "+18.2% vs last year", changeType: "positive", icon: <DollarSign className="h-6 w-6" /> },
    { title: "Monthly Revenue", value: formatAmount(128450, currency), change: "+5.3% vs last month", changeType: "positive", icon: <TrendingUp className="h-6 w-6" /> },
    { title: "Successful Payments", value: `${succeededPayments}`, change: `${recentPayments.length} total`, changeType: "positive", icon: <CheckCircle2 className="h-6 w-6" /> },
    { title: "Failed Payments", value: `${failedPayments}`, change: "Needs attention", changeType: failedPayments > 0 ? "negative" : "neutral", icon: <XCircle className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Billing</h1>
          <p className="text-sm text-dark-400 mt-1">Revenue overview and payment history</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
                  <span>+18.2%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {monthlyRevenue.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-dark-400">{formatAmount(m.value, currency)}</span>
                    <div className="w-full bg-gold-500/20 rounded-t-md relative" style={{ height: `${(m.value / maxRevenue) * 140}px` }}>
                      <div className="absolute inset-0 bg-gold-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-dark-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Revenue Breakdown</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Stripe Revenue", value: 89200, percentage: 69.4, color: "bg-purple-500" },
                { label: "Razorpay Revenue", value: 39250, percentage: 30.6, color: "bg-blue-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-200">{item.label}</span>
                    <span className="text-sm font-semibold text-gold-400">{formatAmount(item.value, currency)}</span>
                  </div>
                  <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-dark-500">{item.percentage}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Plan Revenue</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { plan: "Starter", count: 412, revenue: 7828, color: "bg-dark-500" },
                { plan: "Professional", count: 328, revenue: 16072, color: "bg-brand-500" },
                { plan: "Enterprise", count: 152, revenue: 22648, color: "bg-gold-500" },
              ].map((p) => (
                <div key={p.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${p.color}`} />
                    <span className="text-sm text-dark-300">{p.plan}</span>
                    <span className="text-xs text-dark-500">({p.count})</span>
                  </div>
                  <span className="text-sm font-semibold text-dark-200">{formatAmount(p.revenue, currency)}</span>
                </div>
              ))}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-dark-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-dark-300">{payment.invoiceId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dark-100 truncate">{payment.user}</p>
                      <p className="text-xs text-dark-400 truncate">{payment.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="default">{payment.plan}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={payment.provider === "Stripe" ? "info" : "warning"}>{payment.provider}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${payment.status === "refunded" ? "text-amber-400" : payment.status === "failed" ? "text-red-400" : "text-emerald-400"}`}>
                      {payment.status === "refunded" ? "-" : ""}{formatAmount(payment.amount, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-dark-400">{payment.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={paymentStatusConfig[payment.status].variant as any}>
                      <span className="flex items-center gap-1">{paymentStatusConfig[payment.status].icon}{paymentStatusConfig[payment.status].label}</span>
                    </Badge>
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
