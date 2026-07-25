import { UserManagement } from "@/components/admin/UserManagement";

export function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <UserManagement users={[]} />
    </div>
  );
}
