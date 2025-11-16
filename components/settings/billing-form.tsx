"use client";

import { UsageIndicator } from "@/components/usage-indicator";
import { PlanComparison } from "@/components/plan-comparison";
import { useSubscriptionAccess } from "@/hooks/use-subscription";
import { PLANS } from "@/utils/plans";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function BillingForm() {
  const { organization, plan, planConfig, subscriptionStatus, loading, role } =
    useSubscriptionAccess();

  const canManageBilling = role === "owner" || role === "admin";

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading billing information...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canManageBilling && organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
          <CardDescription>
            View your organization's subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>View Only Access</AlertTitle>
            <AlertDescription>
              Only organization owners and admins can manage billing and
              subscription settings. Contact your organization administrator to
              make changes.
            </AlertDescription>
          </Alert>

          <div className="pt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Current Plan
              </p>
              <p className="text-2xl font-bold capitalize">{planConfig.name}</p>
            </div>

            {organization && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-lg capitalize">{subscriptionStatus}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
