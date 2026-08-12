import { useState } from "react";
import {
  Check,
  Crown,
  Loader2,
  CreditCard,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent } from "@/components/common/Card";
import { toast } from "@/stores/toastStore";
import { useBilling } from "@/hooks/useBilling";
import { billingService } from "@/services/billing.service";
import { loadRazorpayScript } from "@/utils/razorpay";
import { formatInr } from "@/utils/currency";
import type { Plan } from "@/services/billing.service";

function isActiveSubscription(plan: string, status: string | undefined): boolean {
  return status === "active" || status === "trialing";
}

function planButtonLabel(plan: Plan, currentPlan: string | undefined, isActive: boolean): string {
  if (plan.id === currentPlan && isActive) return "Current Plan";
  if (currentPlan && currentPlan !== "free") return "Upgrade";
  return "Subscribe";
}

export function BillingPage() {
  const { plans, subscription, isLoading, error, refetch } = useBilling();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const currentPlan = subscription?.plan || "free";
  const subscriptionActive = isActiveSubscription(currentPlan, subscription?.status);

  async function handleSubscribe(plan: Plan) {
    setProcessingPlan(plan.id);
    try {
      const order = await billingService.checkout(plan.id);
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout could not be initialized");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Oryntal Estate",
        description: `${plan.name} plan · monthly`,
        order_id: order.orderId,
        theme: { color: "#c9a15a" },
        handler: async (response) => {
          try {
            await billingService.verify(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            toast("success", `You're on the ${plan.name} plan now. Welcome aboard!`);
            refetch();
          } catch (err) {
            const message = err instanceof Error ? err.message : "Payment verification failed";
            toast("error", message);
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setProcessingPlan(null),
        },
      });

      checkout.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start payment";
      toast("error", message);
      setProcessingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Billing & Plans</h1>
          <p className="text-sm text-dark-400 mt-1">
            Simple monthly pricing in INR. Paid securely via Razorpay.
          </p>
        </div>
        {subscription && (
          <div className="flex items-center gap-2">
            <Badge variant={subscriptionActive ? "success" : "warning"}>
              {subscriptionActive ? "Active" : "Pending"}
            </Badge>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {subscription && subscriptionActive && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-gold-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-gold-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Current plan</p>
                <p className="text-lg font-semibold text-dark-100 capitalize">
                  {currentPlan === "free" ? "Free" : `${currentPlan} Plan`}
                </p>
                {subscription.current_period_end && (
                  <p className="text-xs text-dark-400">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
            {subscription.amount ? (
              <div className="text-right">
                <p className="text-2xl font-bold text-gold-400">{formatInr(subscription.amount)}</p>
                <p className="text-xs text-dark-400">per month</p>
              </div>
            ) : (
              <Badge variant="default">Free tier</Badge>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading && plans.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-dark-700 rounded w-24 animate-pulse" />
                  <div className="h-8 bg-dark-700 rounded w-32 animate-pulse" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-3 bg-dark-700 rounded animate-pulse" />
                    ))}
                  </div>
                  <div className="h-10 bg-dark-700 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          : plans.length === 0 && !isLoading ? (
            <div className="col-span-full py-16 text-center">
              <CreditCard className="h-10 w-10 mx-auto text-dark-500 mb-3" />
              <p className="text-dark-300 font-medium">No plans available</p>
              <p className="text-sm text-dark-500 mt-1">Please try again later.</p>
            </div>
          ) : (
          plans.map((plan) => {
              const isCurrent = plan.id === currentPlan && subscriptionActive;
              const label = planButtonLabel(plan, currentPlan, subscriptionActive);
              return (
                <Card
                  key={plan.id}
                  className={plan.highlighted ? "border-gold-500/40 ring-1 ring-gold-500/20" : ""}
                >
                  <CardContent className="p-6 flex flex-col gap-5 h-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {plan.highlighted ? (
                          <Sparkles className="h-4 w-4 text-gold-400" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-dark-400" />
                        )}
                        <h3 className="font-semibold text-dark-100">{plan.name}</h3>
                      </div>
                      {isCurrent && <Badge variant="success">Current</Badge>}
                    </div>

                    <div>
                      <p className="text-3xl font-bold text-dark-100">
                        {formatInr(plan.priceInr)}
                      </p>
                      <p className="text-xs text-dark-400 mt-1">per month, billed in INR</p>
                    </div>

                    <ul className="flex-1 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-dark-200">
                          <Check className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.highlighted ? "primary" : "secondary"}
                      disabled={isCurrent || processingPlan !== null}
                      onClick={() => handleSubscribe(plan)}
                      className="w-full"
                    >
                      {processingPlan === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrent ? (
                        <>
                          <BadgeCheck className="h-4 w-4 mr-2" />
                          Current Plan
                        </>
                      ) : (
                        label
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
      </div>

      <p className="text-xs text-dark-500 text-center">
        Payments are processed securely by Razorpay. Your plan is activated as soon as payment is
        confirmed on our servers.
      </p>
    </div>
  );
}
