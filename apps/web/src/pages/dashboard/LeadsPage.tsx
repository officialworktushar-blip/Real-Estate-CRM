import { Plus } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardContent } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";

export function LeadsPage() {
  const { leads, meta, isLoading, search, setSearch, refetch } = useLeads();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Lead</Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card>
        <CardContent>
          <DataTable
            data={leads as any[]}
            columns={[
              { key: "name", label: "Name", render: (l: any) => `${l.first_name} ${l.last_name}` },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "status", label: "Status", render: (l: any) => <Badge>{l.status}</Badge> },
              { key: "source", label: "Source" },
            ]}
          />
          {leads.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 py-8">No leads found</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{meta.total} total leads</span>
        <span>Page {meta.page} of {meta.total_pages || 1}</span>
      </div>
    </div>
  );
}
