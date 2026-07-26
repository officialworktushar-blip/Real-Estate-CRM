import { useState } from "react";
import {
  Search,
  UserCheck,
  UserX,
  MoreHorizontal,
  Download,
  Filter,
  Shield,
  Mail,
  Globe,
  Calendar,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { formatDate } from "@/utils/helpers";

type UserRole = "user" | "super_admin";
type UserStatus = "active" | "suspended" | "pending";
type UserPlan = "starter" | "professional" | "enterprise";

const dummyUsers = [
  { id: "1", name: "Alex Thompson", email: "alex@realty.com", role: "user" as UserRole, plan: "professional" as UserPlan, status: "active" as UserStatus, country: "US", joined: "2026-01-15", lastActive: "2 hours ago", deals: 24, revenue: 185000 },
  { id: "2", name: "Priya Sharma", email: "priya@homes.in", role: "user" as UserRole, plan: "enterprise" as UserPlan, status: "active" as UserStatus, country: "IN", joined: "2026-02-20", lastActive: "1 hour ago", deals: 38, revenue: 312000 },
  { id: "3", name: "Marcus Johnson", email: "marcus@estate.com", role: "user" as UserRole, plan: "starter" as UserPlan, status: "active" as UserStatus, country: "US", joined: "2026-03-10", lastActive: "5 hours ago", deals: 8, revenue: 42000 },
  { id: "4", name: "Emma Wilson", email: "emma@prop.co", role: "user" as UserRole, plan: "professional" as UserPlan, status: "pending" as UserStatus, country: "GB", joined: "2026-07-20", lastActive: "Just now", deals: 0, revenue: 0 },
  { id: "5", name: "Raj Patel", email: "raj@build.in", role: "super_admin" as UserRole, plan: "enterprise" as UserPlan, status: "active" as UserStatus, country: "IN", joined: "2025-11-01", lastActive: "30 min ago", deals: 0, revenue: 0 },
  { id: "6", name: "Sofia Garcia", email: "sofia@realty.mx", role: "user" as UserRole, plan: "starter" as UserPlan, status: "active" as UserStatus, country: "MX", joined: "2026-04-05", lastActive: "1 day ago", deals: 12, revenue: 78000 },
  { id: "7", name: "Tom Chen", email: "tom@homes.com", role: "user" as UserRole, plan: "professional" as UserPlan, status: "active" as UserStatus, country: "US", joined: "2026-05-12", lastActive: "3 hours ago", deals: 18, revenue: 145000 },
  { id: "8", name: "Aisha Khan", email: "aisha@estate.pk", role: "user" as UserRole, plan: "starter" as UserPlan, status: "suspended" as UserStatus, country: "PK", joined: "2026-06-01", lastActive: "2 weeks ago", deals: 5, revenue: 28000 },
  { id: "9", name: "David Lee", email: "david@property.com", role: "user" as UserRole, plan: "enterprise" as UserPlan, status: "active" as UserStatus, country: "US", joined: "2025-12-15", lastActive: "4 hours ago", deals: 42, revenue: 425000 },
  { id: "10", name: "Maria Rodriguez", email: "maria@realty.com", role: "user" as UserRole, plan: "professional" as UserPlan, status: "active" as UserStatus, country: "ES", joined: "2026-01-28", lastActive: "6 hours ago", deals: 15, revenue: 98000 },
  { id: "11", name: "Chen Wei", email: "chen@homes.cn", role: "user" as UserRole, plan: "enterprise" as UserPlan, status: "active" as UserStatus, country: "CN", joined: "2026-03-22", lastActive: "12 hours ago", deals: 28, revenue: 265000 },
  { id: "12", name: "Nina Petrova", email: "nina@estate.ru", role: "user" as UserRole, plan: "starter" as UserPlan, status: "suspended" as UserStatus, country: "RU", joined: "2026-05-18", lastActive: "1 month ago", deals: 3, revenue: 15000 },
];

const countryFlags: Record<string, string> = {
  US: "🇺🇸", IN: "🇮🇳", GB: "🇬🇧", MX: "🇲🇽", PK: "🇵🇰", ES: "🇪🇸", CN: "🇨🇳", RU: "🇷🇺",
};

const roleConfig: Record<UserRole, { label: string; variant: string }> = {
  user: { label: "User", variant: "default" },
  super_admin: { label: "Admin", variant: "danger" },
};

const planConfig: Record<UserPlan, { label: string; variant: string }> = {
  starter: { label: "Starter", variant: "default" },
  professional: { label: "Professional", variant: "info" },
  enterprise: { label: "Enterprise", variant: "warning" },
};

const statusConfig: Record<UserStatus, { label: string; variant: string }> = {
  active: { label: "Active", variant: "success" },
  suspended: { label: "Suspended", variant: "danger" },
  pending: { label: "Pending", variant: "warning" },
};

export function UsersPage() {
  const [isLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [planFilter, setPlanFilter] = useState<UserPlan | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [users, setUsers] = useState(dummyUsers);

  const toggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (u.role === "super_admin") return u;
        return { ...u, status: u.status === "suspended" ? "active" : "suspended" };
      })
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchPlan && matchStatus;
  });

  const totalRevenue = filtered.reduce((sum, u) => sum + u.revenue, 0);
  const activeCount = filtered.filter((u) => u.status === "active").length;
  const suspendedCount = filtered.filter((u) => u.status === "suspended").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Users</h1>
          <p className="text-sm text-dark-400 mt-1">
            {filtered.length} users · {activeCount} active · {suspendedCount} suspended
          </p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-dark-100">{filtered.length}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{activeCount}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-400">{suspendedCount}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-gold-400">{filtered.filter((u) => u.role === "super_admin").length}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Admins</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="super_admin">Admin</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as UserPlan | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Country</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Last Active</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                : filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                            user.role === "super_admin" ? "bg-red-500/10 text-red-400" : "bg-gold-500/10 text-gold-400"
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate">{user.name}</p>
                            <p className="text-xs text-dark-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant={roleConfig[user.role].variant as any}>
                          {user.role === "super_admin" && <Shield className="h-3 w-3 mr-1" />}
                          {roleConfig[user.role].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant={planConfig[user.plan].variant as any}>{planConfig[user.plan].label}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{countryFlags[user.country] || "🌍"}</span>
                          <span className="text-sm text-dark-300">{user.country}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-dark-500" />
                          <span className="text-xs text-dark-400">{formatDate(user.joined)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-dark-400">{user.lastActive}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig[user.status].variant as any}>{statusConfig[user.status].label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.role !== "super_admin" && (
                          <button
                            onClick={() => toggleStatus(user.id)}
                            className={`p-1.5 rounded-md transition-colors ${
                              user.status === "suspended"
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : "text-red-400 hover:bg-red-500/10"
                            }`}
                            title={user.status === "suspended" ? "Activate" : "Suspend"}
                          >
                            {user.status === "suspended" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
