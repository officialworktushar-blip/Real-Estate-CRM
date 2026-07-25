import { SubscriptionPlans } from "@/components/admin/SubscriptionPlans";

export function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <SubscriptionPlans plans={[]} />
    </div>
  );
}
