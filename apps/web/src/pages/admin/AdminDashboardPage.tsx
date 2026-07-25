import { Users, Building2, Handshake, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SystemStats } from "@/components/admin/SystemStats";

export function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <SystemStats stats={[
        { label: "Total Users", value: "--" },
        { label: "Organizations", value: "--" },
        { label: "Total Leads", value: "--" },
        { label: "MRR", value: "$0" },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Users" value="--" icon={<Users className="h-6 w-6" />} />
        <StatsCard title="Organizations" value="--" icon={<Building2 className="h-6 w-6" />} />
        <StatsCard title="Active Deals" value="--" icon={<Handshake className="h-6 w-6" />} />
        <StatsCard title="Revenue" value="$0" icon={<DollarSign className="h-6 w-6" />} />
      </div>
    </div>
  );
}
