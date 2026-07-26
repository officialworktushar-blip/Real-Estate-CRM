import { useState } from "react";
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
  Calendar,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TableRowSkeleton, StatsCardSkeleton } from "@/components/common/Skeleton";
import { formatCurrency, formatDate } from "@/utils/helpers";

type ClientType = "buyer" | "seller" | "investor" | "renter";

const dummyClients = [
  { id: "1", firstName: "Sarah", lastName: "Mitchell", email: "sarah.m@email.com", phone: "(310) 555-0142", type: "buyer" as ClientType, transactions: 2, lifetimeValue: 12500, location: "Beverly Hills", lastContact: "2026-07-25", notes: "Pre-approved for $450K" },
  { id: "2", firstName: "James", lastName: "Rodriguez", email: "james.r@email.com", phone: "(213) 555-0198", type: "buyer" as ClientType, transactions: 1, lifetimeValue: 21600, location: "Santa Monica", lastContact: "2026-07-24", notes: "Cash buyer" },
  { id: "3", firstName: "Emily", lastName: "Chen", email: "emily.c@email.com", phone: "(424) 555-0211", type: "seller" as ClientType, transactions: 3, lifetimeValue: 45000, location: "Pasadena", lastContact: "2026-07-23", notes: "Listing 890 Oak Lane" },
  { id: "4", firstName: "Michael", lastName: "Brown", email: "michael.b@email.com", phone: "(323) 555-0177", type: "investor" as ClientType, transactions: 5, lifetimeValue: 87500, location: "West Hollywood", lastContact: "2026-07-22", notes: "Portfolio of 12 rental units" },
  { id: "5", firstName: "Lisa", lastName: "Anderson", email: "lisa.a@email.com", phone: "(818) 555-0133", type: "buyer" as ClientType, transactions: 1, lifetimeValue: 18600, location: "Glendale", lastContact: "2026-07-21", notes: "First-time buyer" },
  { id: "6", firstName: "David", lastName: "Kim", email: "david.k@email.com", phone: "(310) 555-0155", type: "seller" as ClientType, transactions: 2, lifetimeValue: 36000, location: "Manhattan Beach", lastContact: "2026-07-20", notes: "Relocating to Seattle" },
  { id: "7", firstName: "Rachel", lastName: "Taylor", email: "rachel.t@email.com", phone: "(213) 555-0188", type: "investor" as ClientType, transactions: 4, lifetimeValue: 62000, location: "Koreatown", lastContact: "2026-07-19", notes: "Focus on multi-family" },
  { id: "8", firstName: "Carlos", lastName: "Gutierrez", email: "carlos.g@email.com", phone: "(424) 555-0166", type: "renter" as ClientType, transactions: 1, lifetimeValue: 3500, location: "Echo Park", lastContact: "2026-07-18", notes: "Lease renewal in September" },
  { id: "9", firstName: "Amanda", lastName: "White", email: "amanda.w@email.com", phone: "(323) 555-0144", type: "buyer" as ClientType, transactions: 0, lifetimeValue: 0, location: "Silver Lake", lastContact: "2026-07-17", notes: "New lead, no transactions yet" },
  { id: "10", firstName: "Kevin", lastName: "Nguyen", email: "kevin.n@email.com", phone: "(818) 555-0122", type: "seller" as ClientType, transactions: 1, lifetimeValue: 15300, location: "Burbank", lastContact: "2026-07-15", notes: "Sold 789 Maple Dr" },
];

const typeConfig: Record<ClientType, { label: string; variant: string; icon: React.ReactNode }> = {
  buyer: { label: "Buyer", variant: "info", icon: <Users className="h-4 w-4" /> },
  seller: { label: "Seller", variant: "success", icon: <Building className="h-4 w-4" /> },
  investor: { label: "Investor", variant: "warning", icon: <TrendingUp className="h-4 w-4" /> },
  renter: { label: "Renter", variant: "default", icon: <UserCheck className="h-4 w-4" /> },
};

const clientStats = [
  { title: "Total Clients", value: "124", change: "+8 this month", changeType: "positive" as const, icon: <Users className="h-6 w-6" /> },
  { title: "Active Buyers", value: "48", change: "+3 this month", changeType: "positive" as const, icon: <UserCheck className="h-6 w-6" /> },
  { title: "Active Sellers", value: "32", change: "+2 this month", changeType: "positive" as const, icon: <Building className="h-6 w-6" /> },
  { title: "Investors", value: "18", change: "+1 this month", changeType: "positive" as const, icon: <TrendingUp className="h-6 w-6" /> },
];

export function ClientsPage() {
  const [isLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");

  const filtered = dummyClients.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchType;
  });

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
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Transactions</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Lifetime Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden xl:table-cell">Last Contact</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                : filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-brand-500/10 flex items-center justify-center text-sm font-semibold text-brand-400 shrink-0">
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate">{client.firstName} {client.lastName}</p>
                            <p className="text-xs text-dark-400 truncate">{client.notes}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="space-y-1">
                          <p className="text-xs text-dark-300 truncate max-w-[180px]">{client.email}</p>
                          <p className="text-xs text-dark-400">{client.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-dark-500" />
                          <span className="text-sm text-dark-300">{client.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm font-medium text-dark-200">{client.transactions}</span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-sm font-semibold text-gold-400">{formatCurrency(client.lifetimeValue)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={typeConfig[client.type].variant as any}>{typeConfig[client.type].label}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-dark-500" />
                          <span className="text-xs text-dark-400">{formatDate(client.lastContact)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                            <Phone className="h-4 w-4" />
                          </button>
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
