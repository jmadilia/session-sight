"use client";

import { useSubscriptionAccess } from "@/hooks/use-subscription";
import type { FeatureKey } from "@/utils/plans";
import type { ReactNode } from "react";
import { UpgradePrompt } from "./upgrade-prompt";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Wraps features and conditionally renders based on subscription access
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const { hasFeature, loading, plan, planConfig } = useSubscriptionAccess();

  if (loading) {
    return null;
  }

  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showUpgrade) {
    return (
      <UpgradePrompt
        feature={feature}
        currentPlan={plan}
        suggestedPlan={feature === "multi_user" ? "practice" : "pro"}
      />
    );
  }

  return <>{fallback}</>;
}
