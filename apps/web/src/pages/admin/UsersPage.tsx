import {
  Search,
  UserCheck,
  UserX,
  Download,
  Shield,
  Mail,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { useAdminUsers } from "@/hooks/useAdmin";
import { formatDate } from "@/utils/helpers";

type UserRole = "user" | "super_admin";
type UserStatus = "active" | "suspended" | "pending";

const roleConfig: Record<string, { label: string; variant: string }> = {
  user: { label: "User", variant: "default" },
  super_admin: { label: "Admin", variant: "danger" },
};

const statusConfig: Record<string, { label: string; variant: string }> = {
  active: { label: "Active", variant: "success" },
  suspended: { label: "Suspended", variant: "danger" },
  pending: { label: "Pending", variant: "warning" },
};

export function UsersPage() {
  const { users, isLoading, search, setSearch, error, deactivateUser } = useAdminUsers();

  const activeCount = users.filter((u) => u.is_active).length;
  const suspendedCount = users.filter((u) => !u.is_active).length;
  const adminCount = users.filter((u) => u.role === "super_admin").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Users</h1>
          <p className="text-sm text-dark-400 mt-1">
            {users.length} users · {activeCount} active · {suspendedCount} suspended
          </p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-dark-100">{users.length}</p>
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
            <p className="text-lg font-bold text-gold-400">{adminCount}</p>
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
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Last Active</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-dark-500 text-sm">
                        {search ? "No users match your search." : "No users found."}
                      </td>
                    </tr>
                  )
                  : users.map((user) => (
                      <tr key={user.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                              user.role === "super_admin" ? "bg-red-500/10 text-red-400" : "bg-gold-500/10 text-gold-400"
                            }`}>
                              {(user.full_name || user.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark-100 truncate">{user.full_name || "Unknown"}</p>
                              <p className="text-xs text-dark-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant={(roleConfig[user.role]?.variant || "default") as any}>
                            {user.role === "super_admin" && <Shield className="h-3 w-3 mr-1" />}
                            {roleConfig[user.role]?.label || user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-dark-500" />
                            <span className="text-xs text-dark-400">{formatDate(user.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-xs text-dark-400">
                            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(statusConfig[user.is_active ? "active" : "suspended"]?.variant || "default") as any}>
                            {user.is_active ? "Active" : "Suspended"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.role !== "super_admin" && (
                            <button
                              onClick={() => deactivateUser(user.id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                !user.is_active
                                  ? "text-emerald-400 hover:bg-emerald-500/10"
                                  : "text-red-400 hover:bg-red-500/10"
                              }`}
                              title={user.is_active ? "Suspend" : "Activate"}
                            >
                              {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
