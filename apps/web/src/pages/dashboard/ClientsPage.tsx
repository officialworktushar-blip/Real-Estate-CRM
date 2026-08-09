import React, { useState } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Pencil,
  Trash2,
  Users,
  Building,
  UserCheck,
  TrendingUp,
  Home,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton, StatsCardSkeleton } from "@/components/common/Skeleton";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { ClientFormModal } from "@/components/dashboard/forms/ClientFormModal";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@/types";

type ClientType = "buyer" | "seller" | "tenant" | "landlord" | "investor";

const typeConfig: Record<ClientType, { label: string; variant: string; icon: React.ReactNode }> = {
  buyer: { label: "Buyer", variant: "info", icon: <Users className="h-4 w-4" /> },
  seller: { label: "Seller", variant: "success", icon: <Building className="h-4 w-4" /> },
  tenant: { label: "Tenant", variant: "default", icon: <UserCheck className="h-4 w-4" /> },
  landlord: { label: "Landlord", variant: "warning", icon: <Home className="h-4 w-4" /> },
  investor: { label: "Investor", variant: "warning", icon: <TrendingUp className="h-4 w-4" /> },
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || "";
  const second = parts[1]?.charAt(0) || "";
  return (first + second).toUpperCase();
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export function ClientsPage() {
  const {
    clients,
    isLoading,
    search,
    setSearch,
    error,
    create,
    update,
    remove,
    isSubmitting,
    submitError,
  } = useClients();
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const filtered = clients.filter((c) => {
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchType;
  });

  const buyers = clients.filter((c) => c.type === "buyer").length;
  const sellers = clients.filter((c) => c.type === "seller").length;
  const investors = clients.filter((c) => c.type === "investor").length;

  const clientStats = [
    { title: "Total Clients", value: clients.length.toString(), change: "All clients", changeType: "neutral" as const, icon: <Users className="h-6 w-6" /> },
    { title: "Active Buyers", value: buyers.toString(), change: `${buyers} active`, changeType: "positive" as const, icon: <UserCheck className="h-6 w-6" /> },
    { title: "Active Sellers", value: sellers.toString(), change: `${sellers} active`, changeType: "positive" as const, icon: <Building className="h-6 w-6" /> },
    { title: "Investors", value: investors.toString(), change: `${investors} active`, changeType: "positive" as const, icon: <TrendingUp className="h-6 w-6" /> },
  ];

  const openAdd = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Parameters<typeof create>[0]) => {
    if (editingClient) {
      return update(editingClient.id, data);
    }
    return create(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Clients</h1>
          <p className="text-sm text-dark-400 mt-1">Manage your client relationships</p>
        </div>
        <Button onClick={openAdd}>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Added</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-dark-500 text-sm">
                        {search ? "No clients match your search." : "No clients yet. Add your first client to get started."}
                      </td>
                    </tr>
                  )
                  : filtered.map((client) => (
                      <tr key={client.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-brand-500/10 flex items-center justify-center text-sm font-semibold text-brand-400 shrink-0">
                              {getInitials(client.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark-100 truncate">{client.full_name}</p>
                              <p className="text-xs text-dark-400 truncate">{client.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-xs text-dark-300 truncate max-w-[180px]">{client.email || "—"}</p>
                            <p className="text-xs text-dark-400">{client.phone || "—"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(typeConfig[client.type as ClientType]?.variant || "default") as any}>
                            {typeConfig[client.type as ClientType]?.label || client.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-dark-400">{formatDate(client.created_at)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {client.phone && (
                              <a
                                href={`tel:${client.phone}`}
                                className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            )}
                            {client.email && (
                              <a
                                href={`mailto:${client.email}`}
                                className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                              >
                                <Mail className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => openEdit(client)}
                              className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                              title="Edit client"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingClient(client)}
                              className="p-1.5 rounded-md text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete client"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingClient}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={() => (deletingClient ? remove(deletingClient.id) : Promise.resolve(false))}
        title="Delete Client"
        message={`Are you sure you want to delete ${deletingClient ? `"${deletingClient.full_name}"` : "this client"}? This action cannot be undone.`}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
