import { AuditLog } from "@/components/admin/AuditLog";

export function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <AuditLog logs={[]} />
    </div>
  );
}
