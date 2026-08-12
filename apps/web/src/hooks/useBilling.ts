import { useState, useEffect, useCallback } from "react";
import { billingService } from "@/services/billing.service";
import type { Plan, Subscription } from "@/services/billing.service";

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useBilling() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    Promise.all([billingService.plans(), billingService.subscription()])
      .then(([plansRes, subRes]) => {
        if (!active) return;
        setPlans(plansRes.data);
        setSubscription(subRes.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(toErrorMessage(err, "Failed to load billing details"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadKey]);

  const refetch = useCallback(() => setLoadKey((k) => k + 1), []);

  return { plans, subscription, isLoading, error, refetch };
}
