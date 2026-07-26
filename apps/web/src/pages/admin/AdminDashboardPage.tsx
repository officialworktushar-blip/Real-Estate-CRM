import { useState } from "react";
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  UserPlus,
  Home,
  Handshake,
  Building2,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";

const kpiStats = [
  { title: "Total Users", value: "1,284", change: "+124 this month", changeType: "positive" as const, icon: <Users className="h-6 w-6" /> },
  { title: "Active Subscriptions", value: "892", change: "+48 this month", changeType: "positive" as const, icon: <CreditCard className="h-6 w-6" /> },
  { title: "Monthly Revenue", value: "calculated", change: "+18.2% vs last month", changeType: "positive" as const, icon: <DollarSign className="h-6 w-6" />, rawValue: 128450 },
  { title: "Total Sales", value: "calculated", change: "+8.3% vs last month", changeType: "positive" as const, icon: <Handshake className="h-6 w-6" />, rawValue: 4285000 },
];

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

const recentSignups = [
  { id: "1", name: "Alex Thompson", email: "alex@realty.com", plan: "Professional", role: "user", country: "US", joined: "2 hours ago", status: "active" },
  { id: "2", name: "Priya Sharma", email: "priya@homes.in", plan: "Enterprise", role: "user", country: "IN", joined: "5 hours ago", status: "active" },
  { id: "3", name: "Marcus Johnson", email: "marcus@estate.com", plan: "Starter", role: "user", country: "US", joined: "8 hours ago", status: "active" },
  { id: "4", name: "Emma Wilson", email: "emma@prop.co", plan: "Professional", role: "user", country: "GB", joined: "12 hours ago", status: "pending" },
  { id: "5", name: "Raj Patel", email: "raj@build.in", plan: "Enterprise", role: "super_admin", country: "IN", joined: "1 day ago", status: "active" },
  { id: "6", name: "Sofia Garcia", email: "sofia@realty.mx", plan: "Starter", role: "user", country: "MX", joined: "1 day ago", status: "active" },
  { id: "7", name: "Tom Chen", email: "tom@homes.com", plan: "Professional", role: "user", country: "US", joined: "2 days ago", status: "active" },
  { id: "8", name: "Aisha Khan", email: "aisha@estate.pk", plan: "Starter", role: "user", country: "PK", joined: "2 days ago", status: "pending" },
];

const planBreakdown = [
  { plan: "Starter", count: 412, revenue: 16480, color: "bg-dark-500" },
  { plan: "Professional", count: 328, revenue: 65600, color: "bg-brand-500" },
  { plan: "Enterprise", count: 152, revenue: 46370, color: "bg-gold-500" },
];

export function AdminDashboardPage() {
  const { currency } = useCurrencyStore();
  const [isLoading] = useState(false);

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
                value={stat.rawValue ? formatAmount(stat.rawValue, currency) : stat.value}
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">Monthly Revenue</h3>
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
                    <div className="w-full bg-brand-500/20 rounded-t-md relative" style={{ height: `${(m.value / maxRevenue) * 140}px` }}>
                      <div className="absolute inset-0 bg-brand-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-dark-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Recent Signups</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-dark-700/50">
                {recentSignups.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-6 py-3 hover:bg-dark-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gold-500/10 flex items-center justify-center text-sm font-semibold text-gold-400 shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-dark-100 truncate">{user.name}</p>
                          {user.role === "super_admin" && <Badge variant="danger">Admin</Badge>}
                        </div>
                        <p className="text-xs text-dark-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <Badge variant="info">{user.plan}</Badge>
                        <p className="text-[10px] text-dark-500 mt-1">{user.joined}</p>
                      </div>
                      <Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Revenue by Plan</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {planBreakdown.map((p) => (
                <div key={p.plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-200">{p.plan}</span>
                    <span className="text-sm font-semibold text-gold-400">{formatAmount(p.revenue, currency)}</span>
                  </div>
                  <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all duration-500`}
                      style={{ width: `${(p.count / 412) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-dark-500">{p.count} subscribers</span>
                    <span className="text-[10px] text-dark-500">{Math.round((p.count / 892) * 100)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Platform Health</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Uptime", value: "99.98%", status: "success" },
                { label: "Avg Response Time", value: "142ms", status: "success" },
                { label: "Error Rate", value: "0.12%", status: "success" },
                { label: "Active Sessions", value: "3,847", status: "info" },
                { label: "Storage Used", value: "2.4 TB", status: "warning" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">{m.label}</span>
                  <Badge variant={m.status as any}>{m.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Quick Stats</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Users", value: "1,284", icon: <Users className="h-4 w-4" /> },
                { label: "Organizations", value: "156", icon: <Building2 className="h-4 w-4" /> },
                { label: "Properties Listed", value: "8,432", icon: <Home className="h-4 w-4" /> },
                { label: "Deals Closed", value: "2,184", icon: <Handshake className="h-4 w-4" /> },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-dark-500">{s.icon}</span>
                    <span className="text-sm text-dark-300">{s.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-dark-100">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
