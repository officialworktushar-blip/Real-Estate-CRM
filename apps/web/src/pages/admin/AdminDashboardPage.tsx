import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Home,
  Handshake,
  Building2,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useAdminSystem, useAdminSubscriptions } from "@/hooks/useAdmin";
import { useCurrencyStore } from "@/stores/currencyStore";
import { formatAmount } from "@/utils/currency";

export function AdminDashboardPage() {
  const { currency } = useCurrencyStore();
  const { stats: systemStats, isLoading: systemLoading } = useAdminSystem();
  const { stats: subStats, subscriptions, isLoading: subsLoading } = useAdminSubscriptions();

  const isLoading = systemLoading || subsLoading;

  const kpiStats = [
    { title: "Total Users", value: systemStats?.total_users?.toLocaleString() || "—", change: "All users", changeType: "neutral" as const, icon: <Users className="h-6 w-6" /> },
    { title: "Active Subscriptions", value: subStats?.active?.toLocaleString() || "—", change: `${subStats?.trialing || 0} trials`, changeType: "positive" as const, icon: <CreditCard className="h-6 w-6" /> },
    { title: "MRR", value: subStats ? formatAmount(subStats.mrr, currency) : "—", change: `${subStats?.total || 0} total subs`, changeType: "positive" as const, icon: <DollarSign className="h-6 w-6" /> },
    { title: "Total Deals", value: systemStats?.total_deals?.toLocaleString() || "—", change: `${systemStats?.total_properties || 0} properties`, changeType: "positive" as const, icon: <Handshake className="h-6 w-6" /> },
  ];

  const recentSignups = subscriptions.slice(0, 8).map((sub) => ({
    id: sub.id,
    name: sub.profiles?.full_name || "Unknown",
    email: sub.profiles?.email || "",
    plan: sub.plan,
    status: sub.status,
    joined: new Date(sub.created_at).toLocaleDateString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Admin Dashboard</h1>
        <p className="text-sm text-dark-400 mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          : kpiStats.map((stat) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={stat.icon}
              />
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Recent Signups</h3>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="px-6 py-8 text-center text-dark-500 text-sm">Loading signups...</div>
              ) : recentSignups.length === 0 ? (
                <div className="px-6 py-8 text-center text-dark-500 text-sm">No signups yet.</div>
              ) : (
                <div className="divide-y divide-dark-700/50">
                  {recentSignups.map((user) => (
                    <div key={user.id} className="flex items-center justify-between px-6 py-3 hover:bg-dark-700/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gold-500/10 flex items-center justify-center text-sm font-semibold text-gold-400 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dark-100 truncate">{user.name}</p>
                          <p className="text-xs text-dark-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="info">{user.plan}</Badge>
                        <Badge variant={user.status === "active" ? "success" : user.status === "trialing" ? "warning" : "default"}>{user.status}</Badge>
                      </div>
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
              <h3 className="font-semibold text-dark-100">Platform Health</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Users", value: systemStats?.total_users?.toLocaleString() || "—", status: "info" as const },
                { label: "Organizations", value: systemStats?.total_organizations?.toLocaleString() || "—", status: "info" as const },
                { label: "Properties Listed", value: systemStats?.total_properties?.toLocaleString() || "—", status: "info" as const },
                { label: "Deals Closed", value: systemStats?.total_deals?.toLocaleString() || "—", status: "info" as const },
                { label: "Storage Used", value: systemStats?.storage_used || "—", status: "warning" as const },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">{m.label}</span>
                  <Badge variant={m.status}>{m.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Subscription Breakdown</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Active", value: subStats?.active || 0, color: "text-emerald-400" },
                { label: "Trialing", value: subStats?.trialing || 0, color: "text-amber-400" },
                { label: "Past Due", value: subStats?.past_due || 0, color: "text-red-400" },
                { label: "Cancelled", value: subStats?.cancelled || 0, color: "text-dark-400" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">{s.label}</span>
                  <span className={`text-sm font-semibold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
