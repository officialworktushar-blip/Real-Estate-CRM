import { Card, CardHeader, CardContent } from "@/components/common/Card";

export function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Revenue Overview</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Billing and revenue data will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
