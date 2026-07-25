import { Plus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";

export function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
      </div>

      <Card>
        <CardContent>
          <DataTable
            data={[]}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "type", label: "Type" },
              { key: "transactions", label: "Transactions" },
            ]}
          />
          <p className="text-center text-gray-500 py-8">No clients yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
