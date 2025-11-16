"use client";

import { useSubscriptionAccess } from "@/hooks/use-subscription";
import type { FeatureKey } from "@/utils/plans";
import { FEATURE_INFO } from "@/utils/plans";
import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  // New: context about what's being locked
  lockedMessage?: string;
}

/**
 * Wraps features and conditionally renders based on subscription access
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgrade = true,
  lockedMessage,
}: FeatureGateProps) {
  const { hasFeature, loading, plan, planConfig } = useSubscriptionAccess();

  if (loading) {
    return null;
  }

  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If showUpgrade is false, just show fallback
  if (!showUpgrade) {
    return <>{fallback}</>;
  }

  // Show contextual locked state
  const featureInfo = FEATURE_INFO[feature];
  const suggestedPlan =
    feature === "multi_user" ||
    feature === "org_sharing" ||
    feature === "team_roles"
      ? "practice"
      : "pro";

  return (
    <div className="relative">
      {/* Show children in disabled state */}
      <div className="pointer-events-none opacity-50 blur-[2px]">
        {children}
      </div>

      {/* Overlay with upgrade message */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-muted">
        <div className="text-center p-6 max-w-sm">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="font-semibold mb-1">{featureInfo.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {lockedMessage || featureInfo.description}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Available on the{" "}
            <span className="font-medium">
              {suggestedPlan === "practice" ? "Practice" : "Professional"}
            </span>{" "}
            plan
          </p>
          <Button size="sm" asChild>
            <Link href="/dashboard/settings?tab=billing">
              Upgrade to Unlock
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
