import { useState } from "react";
import {
  Search,
  Shield,
  UserPlus,
  UserX,
  UserCheck,
  Settings,
  CreditCard,
  Trash2,
  LogIn,
  LogOut,
  Key,
  Database,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";

type LogAction = "user_created" | "user_suspended" | "user_activated" | "admin_login" | "subscription_changed" | "settings_updated" | "payment_failed" | "data_export" | "role_changed" | "user_deleted";

const actionConfig: Record<LogAction, { label: string; icon: React.ReactNode; color: string }> = {
  user_created: { label: "User Created", icon: <UserPlus className="h-4 w-4" />, color: "text-emerald-400" },
  user_suspended: { label: "User Suspended", icon: <UserX className="h-4 w-4" />, color: "text-red-400" },
  user_activated: { label: "User Activated", icon: <UserCheck className="h-4 w-4" />, color: "text-emerald-400" },
  admin_login: { label: "Admin Login", icon: <LogIn className="h-4 w-4" />, color: "text-brand-400" },
  subscription_changed: { label: "Subscription Changed", icon: <CreditCard className="h-4 w-4" />, color: "text-amber-400" },
  settings_updated: { label: "Settings Updated", icon: <Settings className="h-4 w-4" />, color: "text-purple-400" },
  payment_failed: { label: "Payment Failed", icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-400" },
  data_export: { label: "Data Export", icon: <Database className="h-4 w-4" />, color: "text-blue-400" },
  role_changed: { label: "Role Changed", icon: <Key className="h-4 w-4" />, color: "text-gold-400" },
  user_deleted: { label: "User Deleted", icon: <Trash2 className="h-4 w-4" />, color: "text-red-400" },
};

const dummyLogs = [
  { id: "1", action: "admin_login" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Logged in from 192.168.1.1", timestamp: "2026-07-26T14:30:00", severity: "info" },
  { id: "2", action: "user_suspended" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Suspended user Aisha Khan (aisha@estate.pk) - Payment overdue", timestamp: "2026-07-26T13:15:00", severity: "warning" },
  { id: "3", action: "subscription_changed" as LogAction, user: "System", email: "", detail: "Chen Wei upgraded from Professional to Enterprise", timestamp: "2026-07-26T11:00:00", severity: "info" },
  { id: "4", action: "user_created" as LogAction, user: "System", email: "", detail: "New user registered: Emma Wilson (emma@prop.co)", timestamp: "2026-07-26T10:45:00", severity: "info" },
  { id: "5", action: "payment_failed" as LogAction, user: "System", email: "", detail: "Payment failed for Aisha Khan - Invoice INV-2026-004", timestamp: "2026-07-25T09:00:00", severity: "error" },
  { id: "6", action: "settings_updated" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Updated platform email templates", timestamp: "2026-07-25T16:30:00", severity: "info" },
  { id: "7", action: "user_activated" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Activated user Marcus Johnson", timestamp: "2026-07-25T14:00:00", severity: "info" },
  { id: "8", action: "data_export" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Exported user data CSV (1,284 records)", timestamp: "2026-07-25T11:20:00", severity: "info" },
  { id: "9", action: "role_changed" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Changed role for David Lee: User → Super Admin", timestamp: "2026-07-24T15:00:00", severity: "warning" },
  { id: "10", action: "subscription_changed" as LogAction, user: "System", email: "", detail: "Maria Rodriguez cancelled Professional subscription", timestamp: "2026-07-24T12:00:00", severity: "warning" },
  { id: "11", action: "admin_login" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Logged in from 10.0.0.5", timestamp: "2026-07-24T09:00:00", severity: "info" },
  { id: "12", action: "user_deleted" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Deleted inactive user account (test@test.com)", timestamp: "2026-07-23T16:45:00", severity: "error" },
  { id: "13", action: "user_created" as LogAction, user: "System", email: "", detail: "New user registered: Tom Chen (tom@homes.com)", timestamp: "2026-07-23T10:30:00", severity: "info" },
  { id: "14", action: "settings_updated" as LogAction, user: "Raj Patel", email: "raj@build.in", detail: "Updated Stripe webhook endpoint", timestamp: "2026-07-22T14:00:00", severity: "info" },
  { id: "15", action: "payment_failed" as LogAction, user: "System", email: "", detail: "Retry payment failed for Nina Petrova - Invoice INV-2026-007", timestamp: "2026-07-22T09:00:00", severity: "error" },
];

const severityConfig: Record<string, { variant: string }> = {
  info: { variant: "info" },
  warning: { variant: "warning" },
  error: { variant: "danger" },
};

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<LogAction | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filtered = dummyLogs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.email.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    const matchSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchSearch && matchAction && matchSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Audit Logs</h1>
          <p className="text-sm text-dark-400 mt-1">{filtered.length} recorded actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{filtered.filter((l) => l.severity === "info").length} info</Badge>
          <Badge variant="warning">{filtered.filter((l) => l.severity === "warning").length} warnings</Badge>
          <Badge variant="danger">{filtered.filter((l) => l.severity === "error").length} errors</Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as LogAction | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Actions</option>
            {Object.entries(actionConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-dark-700/50">
            {filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-dark-700/30 transition-colors">
                <div className={`shrink-0 mt-0.5 ${actionConfig[log.action].color}`}>
                  {actionConfig[log.action].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-dark-100">{actionConfig[log.action].label}</span>
                    <Badge variant={severityConfig[log.severity].variant as any}>{log.severity}</Badge>
                  </div>
                  <p className="text-sm text-dark-300 mt-1">{log.detail}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-dark-500" />
                      <span className="text-xs text-dark-400">{log.user}</span>
                    </div>
                    {log.email && (
                      <span className="text-xs text-dark-500">{log.email}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-dark-500">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{formatTimestamp(log.timestamp)}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-dark-400">No audit logs found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
