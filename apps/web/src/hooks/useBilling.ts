import { useState, useEffect, useCallback } from "react";
import { billingService, BILLING_PLANS } from "@/services/billing.service";
import type { Plan, Subscription } from "@/services/billing.service";

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useBilling() {
  const [plans, setPlans] = useState<Plan[]>(BILLING_PLANS);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    // Fetch plans and the current subscription independently so a failure on
    // one never hides the other. The static catalog is already rendered.
    Promise.allSettled([billingService.plans(), billingService.subscription()])
      .then(([plansRes, subRes]) => {
        if (!active) return;

        if (
          plansRes.status === "fulfilled" &&
          Array.isArray(plansRes.value.data) &&
          plansRes.value.data.length > 0
        ) {
          setPlans(plansRes.value.data);
        }

        if (subRes.status === "fulfilled") {
          setSubscription(subRes.value.data);
        } else {
          setError(toErrorMessage(subRes.reason, "Could not load your current plan"));
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load billing details");
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
