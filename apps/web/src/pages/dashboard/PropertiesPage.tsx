import { Plus } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardContent } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { formatCurrency } from "@/utils/helpers";

export function PropertiesPage() {
  const { properties, meta, isLoading, search, setSearch } = useProperties();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Property</Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card>
        <CardContent>
          <DataTable
            data={properties as any[]}
            columns={[
              { key: "title", label: "Title" },
              { key: "city", label: "Location", render: (p: any) => `${p.city}, ${p.state}` },
              { key: "price", label: "Price", render: (p: any) => formatCurrency(p.price) },
              { key: "property_type", label: "Type" },
              { key: "status", label: "Status", render: (p: any) => <Badge variant={p.status === "available" ? "success" : "default"}>{p.status}</Badge> },
            ]}
          />
          {properties.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 py-8">No properties found</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{meta.total} total properties</span>
        <span>Page {meta.page} of {meta.total_pages || 1}</span>
      </div>
    </div>
  );
}
