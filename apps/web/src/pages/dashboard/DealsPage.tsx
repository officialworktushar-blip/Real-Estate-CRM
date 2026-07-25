import { Plus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";

export function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deals</h1>
        <Button><Plus className="h-4 w-4 mr-2" /> New Deal</Button>
      </div>

      <Card>
        <CardContent>
          <DataTable
            data={[]}
            columns={[
              { key: "title", label: "Deal" },
              { key: "client", label: "Client" },
              { key: "stage", label: "Stage" },
              { key: "value", label: "Value" },
            ]}
          />
          <p className="text-center text-gray-500 py-8">No deals yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
