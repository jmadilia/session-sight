"use client";

import { UsageIndicator } from "@/components/usage-indicator";
import { PlanComparison } from "@/components/plan-comparison";
import { useSubscriptionAccess } from "@/hooks/use-subscription";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BillingFormProps {
  billing: any;
  userId: string;
}

export function BillingForm({ billing, userId }: BillingFormProps) {
  const { organization, plan, subscriptionStatus, loading, planConfig } =
    useSubscriptionAccess();

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading billing information...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-sm text-muted-foreground">
        No subscription information available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Current Plan
              </p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-bold">{planConfig.name}</h3>
                <Badge
                  variant={
                    subscriptionStatus === "active" ? "default" : "destructive"
                  }>
                  {subscriptionStatus}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">
                {planConfig.price.monthly === 0
                  ? "Free"
                  : `$${planConfig.price.monthly}/mo`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Indicators */}
      <div className="grid gap-4 md:grid-cols-2">
        <UsageIndicator type="clients" variant="detailed" />
        <UsageIndicator type="sessions" variant="detailed" />
      </div>

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <PlanComparison currentPlan={plan} />
      </div>
    </div>
  );
}
