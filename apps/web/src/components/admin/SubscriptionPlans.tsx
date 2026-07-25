import { Card, CardHeader, CardContent } from "@/components/common/Card";

interface PlanStat {
  plan: string;
  count: number;
  status: string;
}

export function SubscriptionPlans({ plans }: { plans: PlanStat[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Subscription Overview</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div key={`${p.plan}-${p.status}`} className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-lg font-bold capitalize">{p.plan}</p>
              <p className="text-sm text-gray-500">{p.status}</p>
              <p className="text-2xl font-bold mt-1">{p.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
