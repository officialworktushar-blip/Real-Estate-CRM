import React from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  MoreHorizontal,
  Users,
  Building,
  UserCheck,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton, StatsCardSkeleton } from "@/components/common/Skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useClients } from "@/hooks/useClients";

type ClientType = "buyer" | "seller" | "investor" | "renter";

const typeConfig: Record<ClientType, { label: string; variant: string; icon: React.ReactNode }> = {
  buyer: { label: "Buyer", variant: "info", icon: <Users className="h-4 w-4" /> },
  seller: { label: "Seller", variant: "success", icon: <Building className="h-4 w-4" /> },
  investor: { label: "Investor", variant: "warning", icon: <TrendingUp className="h-4 w-4" /> },
  renter: { label: "Renter", variant: "default", icon: <UserCheck className="h-4 w-4" /> },
};

export function ClientsPage() {
  const { clients, isLoading, search, setSearch, error } = useClients();
  const [typeFilter, setTypeFilter] = React.useState<ClientType | "all">("all");

  const filtered = clients.filter((c) => {
    const matchType = typeFilter === "all" || c.client_type === typeFilter;
    return matchType;
  });

  const buyers = clients.filter((c) => c.client_type === "buyer").length;
  const sellers = clients.filter((c) => c.client_type === "seller").length;
  const investors = clients.filter((c) => c.client_type === "investor").length;

  const clientStats = [
    { title: "Total Clients", value: clients.length.toString(), change: "All clients", changeType: "neutral" as const, icon: <Users className="h-6 w-6" /> },
    { title: "Active Buyers", value: buyers.toString(), change: `${buyers} active`, changeType: "positive" as const, icon: <UserCheck className="h-6 w-6" /> },
    { title: "Active Sellers", value: sellers.toString(), change: `${sellers} active`, changeType: "positive" as const, icon: <Building className="h-6 w-6" /> },
    { title: "Investors", value: investors.toString(), change: `${investors} active`, changeType: "positive" as const, icon: <TrendingUp className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Clients</h1>
          <p className="text-sm text-dark-400 mt-1">Manage your client relationships</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          : clientStats.map((stat) => <StatsCard key={stat.title} {...stat} />)}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ClientType | "all")}
          className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
        >
          <option value="all">All Types</option>
          {Object.entries(typeConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Transactions</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Lifetime Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Type</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-dark-500 text-sm">
                        {search ? "No clients match your search." : "No clients yet. Add your first client to get started."}
                      </td>
                    </tr>
                  )
                  : filtered.map((client) => (
                      <tr key={client.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-brand-500/10 flex items-center justify-center text-sm font-semibold text-brand-400 shrink-0">
                              {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark-100 truncate">{client.first_name} {client.last_name}</p>
                              <p className="text-xs text-dark-400 truncate">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-xs text-dark-300 truncate max-w-[180px]">{client.email}</p>
                            <p className="text-xs text-dark-400">{client.phone || "—"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm font-medium text-dark-200">{client.total_transactions}</span>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-sm font-semibold text-gold-400">${client.lifetime_value.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(typeConfig[client.client_type as ClientType]?.variant || "default") as any}>
                            {typeConfig[client.client_type as ClientType]?.label || client.client_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {client.phone && (
                              <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                                <Phone className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                              <Mail className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
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
