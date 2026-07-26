import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  MoreHorizontal,
  Heart,
  Filter,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { formatAmount } from "@/utils/currency";
import { useCurrencyStore } from "@/stores/currencyStore";

type PropertyStatus = "available" | "pending" | "sold" | "off_market";
type ViewMode = "grid" | "table";

const dummyProperties = [
  { id: "1", title: "Luxury Villa with Ocean View", address: "1234 Pacific Coast Hwy", city: "Malibu", state: "CA", zip: "90265", type: "Single Family", status: "available" as PropertyStatus, price: 2450000, beds: 5, baths: 4, sqft: 4200, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop", featured: true },
  { id: "2", title: "Modern Downtown Condo", address: "567 Grand Ave #1201", city: "Los Angeles", state: "CA", zip: "90012", type: "Condo", status: "available" as PropertyStatus, price: 875000, beds: 2, baths: 2, sqft: 1400, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop", featured: false },
  { id: "3", title: "Charming Family Home", address: "890 Oak Lane", city: "Pasadena", state: "CA", zip: "91101", type: "Single Family", status: "pending" as PropertyStatus, price: 1120000, beds: 4, baths: 3, sqft: 2800, image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop", featured: false },
  { id: "4", title: "Beachfront Penthouse", address: "200 Ocean Ave #PH2", city: "Santa Monica", state: "CA", zip: "90401", type: "Penthouse", status: "available" as PropertyStatus, price: 3200000, beds: 3, baths: 3, sqft: 3500, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop", featured: true },
  { id: "5", title: "Cozy Studio Apartment", address: "456 Vermont Ave #305", city: "Los Angeles", state: "CA", zip: "90020", type: "Studio", status: "available" as PropertyStatus, price: 320000, beds: 1, baths: 1, sqft: 650, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop", featured: false },
  { id: "6", title: "Spanish Revival Estate", address: "789 Arroyo Dr", city: "Glendale", state: "CA", zip: "91208", type: "Single Family", status: "sold" as PropertyStatus, price: 1450000, beds: 4, baths: 3, sqft: 3100, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", featured: false },
  { id: "7", title: "Sleek Loft in Arts District", address: "321 Traction Ave #LOFT", city: "Los Angeles", state: "CA", zip: "90013", type: "Loft", status: "available" as PropertyStatus, price: 695000, beds: 1, baths: 1, sqft: 1100, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", featured: false },
  { id: "8", title: "Hillside Retreat with Pool", address: "555 Skyline Blvd", city: "Beverly Hills", state: "CA", zip: "90210", type: "Single Family", status: "available" as PropertyStatus, price: 4800000, beds: 6, baths: 5, sqft: 5800, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", featured: true },
  { id: "9", title: "Townhouse Near Old Town", address: "123 Main St #B", city: "Pasadena", state: "CA", zip: "91103", type: "Townhouse", status: "pending" as PropertyStatus, price: 780000, beds: 3, baths: 2, sqft: 1900, image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", featured: false },
];

const statusConfig: Record<PropertyStatus, { label: string; variant: string }> = {
  available: { label: "Available", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  sold: { label: "Sold", variant: "default" },
  off_market: { label: "Off Market", variant: "danger" },
};

const typeFilters = ["All", "Single Family", "Condo", "Townhouse", "Loft", "Studio", "Penthouse"];

export function PropertiesPage() {
  const { currency, toggleCurrency } = useCurrencyStore();
  const [isLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = dummyProperties.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchType = typeFilter === "All" || p.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Properties</h1>
          <p className="text-sm text-dark-400 mt-1">{filtered.length} properties</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-200 hover:border-dark-600 transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            {currency === "USD" ? "$ USD" : "₹ INR"}
          </button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | "all")}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-lg px-3 py-2 focus:border-gold-500 focus:ring-gold-500/20"
          >
            {typeFilters.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="hidden sm:flex items-center bg-dark-800 border border-dark-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-dark-700 text-gold-400" : "text-dark-400 hover:text-dark-200"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-dark-700 text-gold-400" : "text-dark-400 hover:text-dark-200"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((prop) => (
            <div key={prop.id} className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-dark-600 transition-all cursor-pointer group">
              <div className="relative h-48 overflow-hidden">
                <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={statusConfig[prop.status].variant as any}>{statusConfig[prop.status].label}</Badge>
                  {prop.featured && <Badge variant="warning">Featured</Badge>}
                </div>
                <button className="absolute top-3 right-3 p-2 rounded-full bg-dark-900/60 text-dark-200 hover:text-red-400 transition-colors">
                  <Heart className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3">
                  <p className="text-xl font-bold text-white drop-shadow-lg">{formatAmount(prop.price, currency)}</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-dark-100 truncate">{prop.title}</h3>
                <div className="flex items-center gap-1 text-dark-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="text-xs truncate">{prop.city}, {prop.state} {prop.zip}</span>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-dark-700/50">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5 text-dark-500" />
                    <span className="text-xs text-dark-300">{prop.beds} bd</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5 text-dark-500" />
                    <span className="text-xs text-dark-300">{prop.baths} ba</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-3.5 w-3.5 text-dark-500" />
                    <span className="text-xs text-dark-300">{prop.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Beds/Baths</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider hidden lg:table-cell">Sqft</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                  : filtered.map((prop) => (
                      <tr key={prop.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={prop.image} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark-100 truncate">{prop.title}</p>
                              <p className="text-xs text-dark-400 truncate">{prop.city}, {prop.state}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-dark-300">{prop.type}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-dark-300">{prop.beds} / {prop.baths}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-dark-300">{prop.sqft.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gold-400">{formatAmount(prop.price, currency)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusConfig[prop.status].variant as any}>{statusConfig[prop.status].label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
