import {
  DollarSign,
  Users,
  Home,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { useReports } from "@/hooks/useReports";
import { useLeads } from "@/hooks/useLeads";
import { useCurrencyStore } from "@/stores/currencyStore";
import { formatAmount } from "@/utils/currency";

export function ReportsPage() {
  const { currency, toggleCurrency } = useCurrencyStore();
  const { pipeline, performance, revenue, isLoading: reportsLoading } = useReports();
  const { leads, isLoading: leadsLoading } = useLeads();

  const isLoading = reportsLoading || leadsLoading;

  const totalRevenue = revenue.reduce((sum, m) => sum + m.value, 0);
  const totalLeads = leads.length;
  const closedDeals = pipeline.find((s) => s.stage === "closed_won")?.count || 0;
  const conversionRate = performance?.conversion_rate || 0;

  const leadSources = leads.reduce((acc, lead) => {
    const source = lead.source || "Other";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadSourcesArray = Object.entries(leadSources)
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxRevenue = Math.max(...revenue.map((m) => m.value), 1);

  const summaryStats = [
    { title: "Total Revenue", value: formatAmount(totalRevenue, currency), change: performance ? `${performance.conversion_rate}% conversion` : "Loading...", changeType: "positive" as const, icon: <DollarSign className="h-6 w-6" /> },
    { title: "Total Leads", value: totalLeads.toString(), change: `${leads.length} total`, changeType: "positive" as const, icon: <Users className="h-6 w-6" /> },
    { title: "Deals Closed", value: closedDeals.toString(), change: `${pipeline.length} stages`, changeType: "positive" as const, icon: <Home className="h-6 w-6" /> },
    { title: "Conversion Rate", value: `${conversionRate}%`, change: performance ? `Avg deal: ${formatAmount(performance.avg_deal_size, currency)}` : "Loading...", changeType: "positive" as const, icon: <TrendingUp className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Reports</h1>
          <p className="text-sm text-dark-400 mt-1">Analytics and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-200 hover:border-dark-600 transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            {currency === "USD" ? "$ USD" : "₹ INR"}
          </button>
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
                      <span className="text-[10px] text-dark-400">{formatAmount(m.value, currency)}</span>
                      <div className="w-full bg-brand-500/20 rounded-t-md relative" style={{ height: `${(m.value / maxRevenue) * 140}px` }}>
                        <div className="absolute inset-0 bg-brand-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs text-dark-400">{m.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Pipeline Overview</h3>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="h-3 bg-dark-700 rounded w-20" />
                      <div className="flex-1 h-5 bg-dark-700 rounded-full" />
                      <div className="h-3 bg-dark-700 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : pipeline.length === 0 ? (
                <div className="text-center text-dark-500 text-sm py-8">No pipeline data yet</div>
              ) : (
                <div className="space-y-4">
                  {pipeline.map((stage) => {
                    const maxCount = Math.max(...pipeline.map((s) => s.count), 1);
                    return (
                      <div key={stage.stage} className="flex items-center gap-4">
                        <div className="w-28 text-xs font-medium text-dark-400 shrink-0 capitalize">{stage.stage.replace("_", " ")}</div>
                        <div className="flex-1 h-7 bg-dark-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-500"
                            style={{ width: `${Math.max((stage.count / maxCount) * 100, 2)}%` }}
                          />
                        </div>
                        <div className="text-right shrink-0 w-24">
                          <span className="text-sm font-semibold text-dark-200">{stage.count}</span>
                          <span className="text-xs text-dark-400 ml-1">· {formatAmount(stage.value, currency)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Lead Sources</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse space-y-1.5">
                      <div className="flex justify-between"><div className="h-3 bg-dark-700 rounded w-20" /><div className="h-3 bg-dark-700 rounded w-10" /></div>
                      <div className="h-2 bg-dark-700 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : leadSourcesArray.length === 0 ? (
                <div className="text-center text-dark-500 text-sm py-8">No lead data yet</div>
              ) : (
                leadSourcesArray.map((source) => (
                  <div key={source.source} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-200">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dark-400">{source.count}</span>
                        <span className="text-xs text-dark-500">{source.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${source.percentage}%` }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Performance Metrics</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex justify-between">
                      <div className="h-3 bg-dark-700 rounded w-32" />
                      <div className="h-3 bg-dark-700 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : performance ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-300">Avg Days to Close</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark-100">{performance.avg_days_to_close} days</span>
                      <ArrowDownRight className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-300">Avg Deal Size</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark-100">{formatAmount(performance.avg_deal_size, currency)}</span>
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-300">Conversion Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark-100">{performance.conversion_rate}%</span>
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-300">Total Leads</span>
                    <span className="text-sm font-semibold text-dark-100">{performance.total_leads}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-dark-500 text-sm py-8">No performance data yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
