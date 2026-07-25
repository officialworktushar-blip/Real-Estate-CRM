import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/common/Button";

interface UserItem {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  users?: { email: string };
}

export function UserManagement({ users }: { users: UserItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold">User Management</h3>
        <Button variant="secondary" size="sm">Export CSV</Button>
      </CardHeader>
      <CardContent>
        <DataTable
          data={users as any[]}
          columns={[
            { key: "full_name", label: "Name" },
            { key: "email", label: "Email", render: (u: any) => u.users?.email || "N/A" },
            { key: "role", label: "Role", render: (u: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "super_admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                {u.role}
              </span>
            )},
            { key: "created_at", label: "Joined", render: (u: any) => new Date(u.created_at).toLocaleDateString() },
          ]}
        />
      </CardContent>
    </Card>
  );
}
