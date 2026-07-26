import { useState } from "react";
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
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { formatCurrency, formatDate } from "@/utils/helpers";

const statsData = [
  { title: "Total Leads", value: 248, change: "+12% this month", changeType: "positive" as const, icon: <Users className="h-6 w-6" /> },
  { title: "Active Properties", value: 86, change: "+5% this month", changeType: "positive" as const, icon: <Home className="h-6 w-6" /> },
  { title: "Open Deals", value: 34, change: "-2% this month", changeType: "negative" as const, icon: <Handshake className="h-6 w-6" /> },
  { title: "Revenue", value: formatCurrency(1284500), change: "+18% this month", changeType: "positive" as const, icon: <DollarSign className="h-6 w-6" /> },
];

const recentLeads = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@email.com", source: "Website", status: "new", budget: 450000, created_at: "2026-07-25" },
  { id: "2", name: "James Rodriguez", email: "james@email.com", source: "Referral", status: "qualified", budget: 720000, created_at: "2026-07-24" },
  { id: "3", name: "Emily Chen", email: "emily@email.com", source: "Zillow", status: "contacted", budget: 380000, created_at: "2026-07-23" },
  { id: "4", name: "Michael Brown", email: "michael@email.com", source: "Social Media", status: "new", budget: 550000, created_at: "2026-07-22" },
  { id: "5", name: "Lisa Anderson", email: "lisa@email.com", source: "Open House", status: "negotiation", budget: 620000, created_at: "2026-07-21" },
];

const upcomingEvents = [
  { id: "1", title: "Property Viewing - 123 Oak Ave", time: "10:00 AM", date: "Today", type: "viewing" },
  { id: "2", title: "Client Meeting - Sarah Mitchell", time: "2:00 PM", date: "Today", type: "meeting" },
  { id: "3", title: "Open House - 456 Pine St", time: "11:00 AM", date: "Tomorrow", type: "open_house" },
  { id: "4", title: "Deal Closing - Rodriguez", time: "3:00 PM", date: "Jul 28", type: "closing" },
];

const pipelineStages = [
  { stage: "Lead", count: 45, value: 18500000, color: "bg-dark-500" },
  { stage: "Contacted", count: 32, value: 12800000, color: "bg-brand-500" },
  { stage: "Qualified", count: 28, value: 9400000, color: "bg-blue-500" },
  { stage: "Proposal", count: 18, value: 7200000, color: "bg-purple-500" },
  { stage: "Negotiation", count: 12, value: 5100000, color: "bg-amber-500" },
  { stage: "Closed", count: 8, value: 3400000, color: "bg-emerald-500" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "new": return "info";
    case "qualified": return "success";
    case "contacted": return "warning";
    case "negotiation": return "default";
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

export function DashboardPage() {
  const [isLoading] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
          <p className="text-sm text-dark-400 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Quick Action
        </Button>
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
                      <span className="text-sm text-dark-300 hidden sm:block">{formatCurrency(lead.budget)}</span>
                      <Badge variant={statusColor(lead.status) as any}>{lead.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Deal Pipeline</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStages.map((stage) => (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-24 text-xs font-medium text-dark-400 shrink-0">{stage.stage}</div>
                    <div className="flex-1 h-7 bg-dark-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                        style={{ width: `${(stage.count / 45) * 100}%` }}
                      />
                    </div>
                    <div className="text-right shrink-0 w-20">
                      <span className="text-sm font-semibold text-dark-200">{stage.count}</span>
                      <span className="text-xs text-dark-400 ml-1">deals</span>
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">Upcoming Events</h3>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Top Properties</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-dark-700/50">
                {[
                  { title: "Luxury Villa, Beverly Hills", price: 2450000, beds: 5, status: "available" },
                  { title: "Modern Condo, Downtown", price: 875000, beds: 2, status: "available" },
                  { title: "Family Home, Pasadena", price: 1120000, beds: 4, status: "pending" },
                ].map((p, i) => (
                  <div key={i} className="px-6 py-3 hover:bg-dark-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-100 truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-dark-500" />
                          <span className="text-xs text-dark-400">{p.beds} beds</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gold-400">{formatCurrency(p.price)}</p>
                        <Badge variant={p.status === "available" ? "success" : "warning"}>{p.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-dark-100">Performance</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Conversion Rate", value: "24.8%", trend: "up", change: "+2.3%" },
                { label: "Avg. Deal Size", value: formatCurrency(385000), trend: "up", change: "+5.1%" },
                { label: "Response Time", value: "2.4h", trend: "down", change: "-0.8h" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dark-100">{m.value}</span>
                    <span className={`flex items-center text-xs ${m.trend === "up" ? "text-emerald-400" : "text-emerald-400"}`}>
                      {m.trend === "up" ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                      {m.change}
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
