"use client";

import { PLANS, PlanType } from "@/utils/plans";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanComparisonProps {
  currentPlan?: PlanType;
  onSelectPlan?: (plan: PlanType) => void;
  showCurrentBadge?: boolean;
}

export function PlanComparison({
  currentPlan,
  onSelectPlan,
  showCurrentBadge = true,
}: PlanComparisonProps) {
  const planOrder: PlanType[] = ["free", "pro", "practice"];

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      {planOrder.map((planKey) => {
        const plan = PLANS[planKey];
        const isCurrent = currentPlan === planKey;
        const isPopular = planKey === "pro";

        return (
          <Card
            key={planKey}
            className={cn(
              "relative flex flex-col",
              isPopular && "border-primary shadow-lg",
              isCurrent && "ring-2 ring-primary"
            )}>
            {isPopular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-32">
                <Badge className="w-full justify-center">Most Popular</Badge>
              </div>
            )}
            {isCurrent && showCurrentBadge && (
              <div className="absolute -top-4 right-4">
                <Badge variant="secondary">Current Plan</Badge>
              </div>
            )}

            <CardHeader className="text-center pb-8 pt-6">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${plan.price.monthly}
                </span>
                {planKey !== "free" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Limits:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>
                      {plan.limits.clients === Infinity
                        ? "Unlimited"
                        : plan.limits.clients}{" "}
                      clients
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>
                      {plan.limits.sessions === Infinity
                        ? "Unlimited"
                        : plan.limits.sessions}{" "}
                      sessions/month
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-balance">
                        {feature === "client_management" && "Client Management"}
                        {feature === "session_tracking" && "Session Tracking"}
                        {feature === "appointments" && "Appointment Scheduling"}
                        {feature === "basic_analytics" && "Basic Analytics"}
                        {feature === "basic_treatment_plans" &&
                          "Basic Treatment Plans"}
                        {feature === "progress_notes" && "Progress Notes"}
                        {feature === "unlimited_clients" && "Unlimited Clients"}
                        {feature === "unlimited_sessions" &&
                          "Unlimited Sessions"}
                        {feature === "advanced_analytics" &&
                          "Advanced Analytics & Reports"}
                        {feature === "early_warning_system" &&
                          "Early Warning System"}
                        {feature === "calendar_sync" && "Calendar Sync"}
                        {feature === "unlimited_treatment_plans" &&
                          "Unlimited Treatment Plans"}
                        {feature === "custom_notes_templates" &&
                          "Custom Note Templates"}
                        {feature === "export_reports" && "Export Reports"}
                        {feature === "client_portal" && "Client Portal"}
                        {feature === "multi_user" && "Multi-User Support"}
                        {feature === "org_sharing" &&
                          "Organization-wide Sharing"}
                        {feature === "team_roles" && "Team Roles & Permissions"}
                        {feature === "team_analytics" && "Team Analytics"}
                        {feature === "billing_reports" && "Billing Reports"}
                        {feature === "admin_dashboard" && "Admin Dashboard"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={
                  isCurrent ? "outline" : isPopular ? "default" : "secondary"
                }
                disabled={isCurrent}
                onClick={() => onSelectPlan?.(planKey)}>
                {isCurrent
                  ? "Current Plan"
                  : planKey === "free"
                  ? "Start Free"
                  : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
