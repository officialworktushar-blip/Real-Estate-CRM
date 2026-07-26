import { useState } from "react";
import {
  DollarSign,
  Users,
  Home,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { formatCurrency } from "@/utils/helpers";

const summaryStats = [
  { title: "Total Revenue", value: formatCurrency(1284500), change: "+18.2% vs last quarter", changeType: "positive" as const, icon: <DollarSign className="h-6 w-6" /> },
  { title: "Total Leads", value: "248", change: "+12.5% vs last quarter", changeType: "positive" as const, icon: <Users className="h-6 w-6" /> },
  { title: "Properties Sold", value: "34", change: "+8.3% vs last quarter", changeType: "positive" as const, icon: <Home className="h-6 w-6" /> },
  { title: "Conversion Rate", value: "24.8%", change: "+2.1% vs last quarter", changeType: "positive" as const, icon: <TrendingUp className="h-6 w-6" /> },
];

const monthlyRevenue = [
  { month: "Jan", value: 145000 },
  { month: "Feb", value: 168000 },
  { month: "Mar", value: 192000 },
  { month: "Apr", value: 175000 },
  { month: "May", value: 210000 },
  { month: "Jun", value: 198000 },
  { month: "Jul", value: 196500 },
];

const leadSources = [
  { source: "Website", count: 86, percentage: 34.7, color: "bg-brand-500" },
  { source: "Referral", count: 62, percentage: 25.0, color: "bg-gold-500" },
  { source: "Zillow", count: 41, percentage: 16.5, color: "bg-emerald-500" },
  { source: "Social Media", count: 35, percentage: 14.1, color: "bg-purple-500" },
  { source: "Open House", count: 24, percentage: 9.7, color: "bg-amber-500" },
];

const topAgents = [
  { name: "Sarah Johnson", deals: 12, revenue: 425000, avatar: "SJ" },
  { name: "Michael Chen", deals: 9, revenue: 312000, avatar: "MC" },
  { name: "Emily Park", deals: 8, revenue: 287000, avatar: "EP" },
  { name: "David Lee", deals: 6, revenue: 198000, avatar: "DL" },
];

const recentActivity = [
  { action: "Deal Closed", detail: "789 Maple Dr - Kevin Nguyen", amount: 15300, time: "2 hours ago", type: "positive" },
  { action: "New Lead", detail: "Jennifer Lee via Website", amount: null, time: "3 hours ago", type: "neutral" },
  { action: "Deal Closed", detail: "200 Ocean Ave - Robert Garcia", amount: 96000, time: "1 day ago", type: "positive" },
  { action: "Lead Lost", detail: "Amanda White - chose competitor", amount: null, time: "2 days ago", type: "negative" },
  { action: "New Lead", detail: "Robert Garcia via Referral", amount: null, time: "2 days ago", type: "neutral" },
];

const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));

export function ReportsPage() {
  const [isLoading] = useState(false);
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Reports</h1>
          <p className="text-sm text-dark-400 mt-1">Analytics and performance insights</p>
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
          : summaryStats.map((stat) => <StatsCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">Revenue Overview</h3>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-brand-500" />
                    <span className="text-dark-400">Revenue</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {monthlyRevenue.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-dark-400">{formatCurrency(m.value)}</span>
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
              <h3 className="font-semibold text-dark-100">Recent Activity</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-dark-700/50">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-dark-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.type === "positive" ? "bg-emerald-500/10" : activity.type === "negative" ? "bg-red-500/10" : "bg-dark-700"
                      }`}>
                        {activity.type === "positive" ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : activity.type === "negative" ? <TrendingDown className="h-4 w-4 text-red-400" /> : <BarChart3 className="h-4 w-4 text-dark-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-100">{activity.action}</p>
                        <p className="text-xs text-dark-400">{activity.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className={`text-sm font-semibold ${activity.type === "positive" ? "text-emerald-400" : "text-red-400"}`}>
                          {activity.type === "positive" ? "+" : "-"}{formatCurrency(activity.amount)}
                        </p>
                      )}
                      <p className="text-[10px] text-dark-500">{activity.time}</p>
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
              <h3 className="font-semibold text-dark-100">Lead Sources</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {leadSources.map((source) => (
                <div key={source.source} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-200">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dark-400">{source.count}</span>
                      <span className="text-xs text-dark-500">{source.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${source.color} transition-all duration-500`} style={{ width: `${source.percentage}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Top Agents</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-dark-700/50">
                {topAgents.map((agent, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-dark-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gold-500/10 flex items-center justify-center text-sm font-semibold text-gold-400">
                        {agent.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-100">{agent.name}</p>
                        <p className="text-xs text-dark-400">{agent.deals} deals</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gold-400">{formatCurrency(agent.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Performance Metrics</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Avg Days to Close", value: "42 days", trend: "down", change: "-5 days" },
                { label: "Avg Deal Size", value: formatCurrency(377794), trend: "up", change: "+8.2%" },
                { label: "Client Satisfaction", value: "4.8/5.0", trend: "up", change: "+0.3" },
                { label: "Repeat Client Rate", value: "32%", trend: "up", change: "+4%" },
                { label: "Lead Response Time", value: "2.4 hours", trend: "down", change: "-0.8h" },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dark-100">{metric.value}</span>
                    <span className={`text-xs ${metric.trend === "down" && metric.label.includes("Time") || metric.label.includes("Days") ? "text-emerald-400" : metric.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                      {metric.trend === "up" ? <ArrowUpRight className="h-3 w-3 inline" /> : <ArrowDownRight className="h-3 w-3 inline" />}
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
