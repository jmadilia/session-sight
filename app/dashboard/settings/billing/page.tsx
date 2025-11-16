import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanComparison } from "@/components/plan-comparison";
import { UsageIndicator } from "@/components/usage-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PLANS } from "@/utils/plans";
import type { Organization } from "@/lib/types/subscription";

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's organization membership
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    redirect("/dashboard");
  }

  // Get organization with subscription details
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .single();

  if (!organization) {
    redirect("/dashboard");
  }

  const org = organization as Organization;

  // Get usage data
  const { data: usage } = await supabase.rpc("get_organization_usage", {
    p_organization_id: org.id,
  });

  const currentUsage = usage || { clients: 0, sessions: 0, members: 0 };
  const planConfig = PLANS[org.plan];

  // Check if subscription is expiring soon (within 7 days)
  const expiringDate = org.subscription_expires_at
    ? new Date(org.subscription_expires_at)
    : null;
  const isExpiringSoon =
    expiringDate &&
    expiringDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
    expiringDate.getTime() > Date.now();

  const trialEndsDate = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const isInTrial = trialEndsDate && trialEndsDate.getTime() > Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and usage
        </p>
      </div>

      {/* Status Alerts */}
      {org.subscription_status === "expired" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Expired</AlertTitle>
          <AlertDescription>
            Your subscription has expired. Please upgrade to continue using
            premium features.
          </AlertDescription>
        </Alert>
      )}

      {isExpiringSoon && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Subscription Expiring Soon</AlertTitle>
          <AlertDescription>
            Your subscription will expire on{" "}
            {expiringDate?.toLocaleDateString()}. Please renew to avoid service
            interruption.
          </AlertDescription>
        </Alert>
      )}

      {isInTrial && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Free Trial Active</AlertTitle>
          <AlertDescription>
            Your free trial ends on {trialEndsDate?.toLocaleDateString()}.
            Upgrade anytime to continue with full access.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {planConfig.name} plan
              </CardDescription>
            </div>
            <Badge
              variant={
                org.subscription_status === "active" ? "default" : "secondary"
              }
              className="capitalize">
              {org.subscription_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Indicators */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Current Usage</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <UsageIndicator type="clients" variant="detailed" />
              <UsageIndicator type="sessions" variant="detailed" />
            </div>
          </div>

          {/* Plan Details */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan Price</span>
              <span className="font-medium">
                {org.plan === "free"
                  ? "Free"
                  : `$${planConfig.price.monthly}/month`}
              </span>
            </div>
            {org.subscription_expires_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Billing Date</span>
                <span className="font-medium">
                  {new Date(org.subscription_expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Available Plans
        </h2>
        <PlanComparison currentPlan={org.plan} />
      </div>

      {/* Billing Note for Owners */}
      {membership.role === "owner" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Manage Billing</AlertTitle>
          <AlertDescription>
            As an organization owner, you can upgrade or change your plan.
            Payment integration coming soon - contact support to upgrade.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
