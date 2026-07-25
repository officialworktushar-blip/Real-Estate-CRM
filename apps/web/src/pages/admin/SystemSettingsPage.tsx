import { Card, CardHeader, CardContent } from "@/components/common/Card";

export function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">General</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Configure platform-wide settings.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Email Templates</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Manage transactional email templates.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Integrations</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Manage third-party integrations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
