import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useAdminSystem } from "@/hooks/useAdmin";

export function AdminDashboardPage() {
  const { user, profile } = useAuth();
  const { stats: systemStats, error: systemError } = useAdminSystem();

  const role = profile?.role || user?.role || "unknown";

  const statCards = [
    { label: "Total Users", value: systemStats?.total_users ?? 0 },
    { label: "Properties", value: systemStats?.total_properties ?? 0 },
    { label: "Deals", value: systemStats?.total_deals ?? 0 },
    { label: "Organizations", value: systemStats?.total_organizations ?? 0 },
    { label: "Active Subscriptions", value: systemStats?.active_subscriptions ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-dark-100">Admin Dashboard</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Admin Dashboard Loaded
          </span>
        </div>
        <p className="text-sm text-dark-400 mt-1">Platform overview and key metrics</p>
      </div>

      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-dark-400">Signed in as</p>
            <p className="text-lg font-semibold text-dark-100 truncate">
              {user?.full_name || user?.email || "Unknown"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-dark-400">Current Role:</span>
            <Badge variant={role === "super_admin" ? "danger" : "default"}>{role}</Badge>
          </div>
        </CardContent>
      </Card>

      {systemError && (
        <Card className="border-red-500/30">
          <CardContent className="py-3 text-sm text-red-400">
            Failed to load admin data: {systemError}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-dark-100">
                {Number.isFinite(s.value) ? s.value.toLocaleString() : "—"}
              </p>
              <p className="text-[10px] text-dark-400 uppercase tracking-wider">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
