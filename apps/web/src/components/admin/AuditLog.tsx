import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  profiles?: { full_name: string };
}

export function AuditLog({ logs }: { logs: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Audit Log</h3>
      </CardHeader>
      <CardContent>
        <DataTable
          data={logs as any[]}
          columns={[
            { key: "action", label: "Action" },
            { key: "entity_type", label: "Entity" },
            { key: "user", label: "User", render: (l: any) => l.profiles?.full_name || "System" },
            { key: "created_at", label: "Time", render: (l: any) => new Date(l.created_at).toLocaleString() },
          ]}
        />
      </CardContent>
    </Card>
  );
}
