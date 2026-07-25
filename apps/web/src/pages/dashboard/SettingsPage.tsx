import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Profile</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm">{user?.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm">{user?.email}</p>
            </div>
          </div>
          <Button variant="secondary">Edit Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Organization</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Manage your team and organization settings.</p>
          <Button variant="secondary" className="mt-4">Manage Organization</Button>
        </CardContent>
      </Card>
    </div>
  );
}
