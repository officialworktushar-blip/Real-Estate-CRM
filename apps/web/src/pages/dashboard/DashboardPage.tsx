import { Users, Home, Handshake, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { useLeads } from "@/hooks/useLeads";

export function DashboardPage() {
  const { leads } = useLeads();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={leads.length || 0} icon={<Users className="h-6 w-6" />} change="+12% this month" changeType="positive" />
        <StatsCard title="Active Properties" value="--" icon={<Home className="h-6 w-6" />} />
        <StatsCard title="Open Deals" value="--" icon={<Handshake className="h-6 w-6" />} />
        <StatsCard title="Revenue" value="$0" icon={<DollarSign className="h-6 w-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentLeads leads={leads as any} />
        </div>
        <CalendarWidget />
      </div>
    </div>
  );
}
