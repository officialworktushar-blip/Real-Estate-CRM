import { useState, useEffect } from "react";
import {
  Users,
  Home,
  Handshake,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useLeads } from "@/hooks/useLeads";
import { useProperties } from "@/hooks/useProperties";
import { useCalendar } from "@/hooks/useCalendar";
import { useReports } from "@/hooks/useReports";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";

const LOADING_TIMEOUT_MS = 5_000;

export function DashboardPage() {
  const { currency, toggleCurrency } = useCurrencyStore();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { events, isLoading: calendarLoading } = useCalendar();
  const { pipeline, performance, isLoading: reportsLoading } = useReports();

  const [forceLoaded, setForceLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setForceLoaded(true), LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const safePipeline = pipeline ?? [];
  const safeLeads = leads ?? [];
  const safeProperties = properties ?? [];
  const safeEvents = events ?? [];

  const isLoading = !forceLoaded && (leadsLoading || propertiesLoading || calendarLoading || reportsLoading);

  const totalDeals = safePipeline.reduce((sum, s) => sum + (s.count || 0), 0);
  const pipelineValue = safePipeline.reduce((sum, s) => sum + (s.value || 0), 0);

  const statsData = [
    { title: "Total Leads", value: safeLeads.length, change: "All leads", changeType: "neutral" as const, icon: <Users className="h-6 w-6" /> },
    { title: "Active Properties", value: safeProperties.length, change: "All properties", changeType: "neutral" as const, icon: <Home className="h-6 w-6" /> },
    { title: "Open Deals", value: totalDeals, change: `${safePipeline.length} stages`, changeType: "neutral" as const, icon: <Handshake className="h-6 w-6" /> },
    { title: "Pipeline Value", value: formatAmount(pipelineValue, currency), change: performance ? `${performance.conversion_rate}% conversion` : "Loading...", changeType: "positive" as const, icon: <DollarSign className="h-6 w-6" /> },
  ];

  const recentLeads = safeLeads.slice(0, 5).map((lead) => ({
    id: lead.id,
    name: lead.full_name || "",
    email: lead.email || "",
    source: lead.source || "",
    status: lead.status,
    budget: lead.budget || 0,
    created_at: lead.created_at,
  }));

  const upcomingEvents = safeEvents.slice(0, 4).map((evt) => {
    const start = new Date(evt.start_time);
    const isValidDate = !Number.isNaN(start.getTime());
    return {
      id: evt.id,
      title: evt.title,
      time: isValidDate
        ? start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : "TBD",
      date: isValidDate
        ? start.toDateString() === new Date().toDateString()
          ? "Today"
          : start.toDateString() === new Date(Date.now() + 86400000).toDateString()
            ? "Tomorrow"
            : start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "TBD",
      type: evt.event_type,
    };
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "new": return "info";
      case "qualified": return "success";
      case "contacted": return "warning";
      case "unqualified": return "default";
      case "converted": return "success";
      default: return "default";
    }
  };

  const eventTypeColor = (t: string) => {
    switch (t) {
      case "viewing": return "bg-brand-500/10 text-brand-400 border border-brand-500/20";
      case "meeting": return "bg-gold-500/10 text-gold-400 border border-gold-500/20";
      case "open_house": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "closing": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      default: return "bg-dark-600/50 text-dark-300 border border-dark-600";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
          <p className="text-sm text-dark-400 mt-1">Welcome back! Here's your business overview.</p>
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
            Quick Action
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          : statsData.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">Recent Leads</h3>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {leadsLoading ? (
                <div className="px-6 py-8 text-center text-dark-500 text-sm">Loading leads...</div>
              ) : recentLeads.length === 0 ? (
                <EmptyState
                  className="py-8"
                  icon={<Users className="h-5 w-5" />}
                  title="No leads yet"
                  description="Add your first lead to get started."
                />
              ) : (
                <div className="divide-y divide-dark-700/50">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between px-6 py-3 hover:bg-dark-700/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gold-500/10 flex items-center justify-center text-sm font-semibold text-gold-400">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-100">{lead.name}</p>
                          <p className="text-xs text-dark-400">{lead.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {lead.budget > 0 && <span className="text-sm text-dark-300 hidden sm:block">{formatAmount(lead.budget, currency)}</span>}
                        <Badge variant={statusColor(lead.status) as any}>{lead.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Deal Pipeline</h3>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="text-center text-dark-500 text-sm py-4">Loading pipeline...</div>
              ) : safePipeline.length === 0 ? (
                <div className="text-center text-dark-500 text-sm py-4">No pipeline data yet.</div>
              ) : (
                <div className="space-y-4">
                  {safePipeline.map((stage) => (
                    <div key={stage.stage} className="flex items-center gap-4">
                      <div className="w-24 text-xs font-medium text-dark-400 shrink-0 capitalize">{stage.stage.replace("_", " ")}</div>
                      <div className="flex-1 h-7 bg-dark-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all duration-500"
                          style={{ width: `${Math.max((stage.count / Math.max(...safePipeline.map((s) => s.count), 1)) * 100, 2)}%` }}
                        />
                      </div>
                      <div className="text-right shrink-0 w-20">
                        <span className="text-sm font-semibold text-dark-200">{stage.count}</span>
                        <span className="text-xs text-dark-400 ml-1">deals</span>
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">Upcoming Events</h3>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {calendarLoading ? (
                <div className="px-6 py-8 text-center text-dark-500 text-sm">Loading events...</div>
              ) : upcomingEvents.length === 0 ? (
                <div className="px-6 py-8 text-center text-dark-500 text-sm">No upcoming events.</div>
              ) : (
                <div className="divide-y divide-dark-700/50">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="px-6 py-3 hover:bg-dark-700/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dark-100 truncate">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-dark-500" />
                            <span className="text-xs text-dark-400">{event.time}</span>
                            <span className="text-xs text-dark-500">·</span>
                            <span className="text-xs text-dark-400">{event.date}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${eventTypeColor(event.type)}`}>
                          {event.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Top Properties</h3>
            </CardHeader>
            <CardContent className="p-0">
              {propertiesLoading ? (
                <div className="px-6 py-8 text-center text-dark-500 text-sm">Loading properties...</div>
              ) : safeProperties.length === 0 ? (
                <div className="px-6 py-8 text-center text-dark-500 text-sm">No properties yet.</div>
              ) : (
                <div className="divide-y divide-dark-700/50">
                  {safeProperties.slice(0, 3).map((p) => (
                    <div key={p.id} className="px-6 py-3 hover:bg-dark-700/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dark-100 truncate">{p.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-dark-500" />
                            <span className="text-xs text-dark-400">{p.bedrooms || 0} beds · {p.city}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gold-400">{formatAmount(p.price, currency)}</p>
                          <Badge variant={p.status === "available" ? "success" : p.status === "pending" ? "warning" : "default"}>{p.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Performance</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportsLoading ? (
                <div className="text-center text-dark-500 text-sm py-4">Loading metrics...</div>
              ) : performance ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-300">Conversion Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark-100">{performance.conversion_rate}%</span>
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-300">Avg. Deal Size</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark-100">{formatAmount(performance.avg_deal_size, currency)}</span>
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-300">Avg. Days to Close</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark-100">{performance.avg_days_to_close}d</span>
                      <TrendingDown className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-dark-500 text-sm py-4">No performance data yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
