"use client";

import { UsageIndicator } from "@/components/usage-indicator";
import { PlanComparison } from "@/components/plan-comparison";
import { useSubscriptionAccess } from "@/hooks/use-subscription";
import { PLANS } from "@/utils/plans";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BillingFormProps {
  billing: any;
  userId: string;
}

export function BillingForm({ billing, userId }: BillingFormProps) {
  const { organization, plan, subscriptionStatus, loading, planConfig } =
    useSubscriptionAccess();

  console.log("[v0] Billing Form Data:", {
    organization,
    plan,
    subscriptionStatus,
    loading,
    planConfig,
  });

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading billing information...
      </div>
    );
  }

  const displayPlan = plan || "free";
  const displayPlanConfig = planConfig || PLANS.free;
  const displayStatus = subscriptionStatus || "active";

  return (
    <div className="space-y-6">
      {!organization && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You're not currently part of an organization. Create or join an
              organization to manage subscriptions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Current Plan
              </p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-bold">{displayPlanConfig.name}</h3>
                <Badge
                  variant={
                    displayStatus === "active" ? "default" : "destructive"
                  }>
                  {displayStatus}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">
                {displayPlanConfig.price.monthly === 0
                  ? "Free"
                  : `$${displayPlanConfig.price.monthly}/mo`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Indicators - only show if user has an organization */}
      {organization && (
        <div className="grid gap-4 md:grid-cols-2">
          <UsageIndicator type="clients" variant="detailed" />
          <UsageIndicator type="sessions" variant="detailed" />
        </div>
      )}

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <PlanComparison currentPlan={displayPlan} />
      </div>
    </div>
  );
}
