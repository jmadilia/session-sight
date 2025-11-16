"use client";

import { useSubscriptionAccess } from "@/hooks/use-subscription";
import type { FeatureKey } from "@/utils/plans";
import { FEATURE_INFO } from "@/utils/plans";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface LockedFeatureButtonProps {
  feature: FeatureKey;
  children: ReactNode;
  href: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Button that either navigates to a feature or shows an upgrade modal if locked
 */
export function LockedFeatureButton({
  feature,
  children,
  href,
  variant = "default",
  size = "default",
}: LockedFeatureButtonProps) {
  const { hasFeature, loading, plan } = useSubscriptionAccess();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        {children}
      </Button>
    );
  }

  const hasAccess = hasFeature(feature);

  // If has access, show normal button
  if (hasAccess) {
    return (
      <Button variant={variant} size={size} asChild>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  // If locked, show button that opens upgrade modal
  const featureInfo = FEATURE_INFO[feature];
  const suggestedPlan =
    feature === "multi_user" ||
    feature === "org_sharing" ||
    feature === "team_roles"
      ? "practice"
      : "pro";
  const suggestedPlanName =
    suggestedPlan === "practice" ? "Practice" : "Professional";

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowUpgradeModal(true)}
        className="relative">
        <Lock className="w-4 h-4 mr-2" />
        {children}
      </Button>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">
              {featureInfo.name}
            </DialogTitle>
            <DialogDescription className="text-center">
              {featureInfo.description}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-sm font-medium">
              Available on the {suggestedPlanName} Plan
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your current plan:{" "}
              <span className="font-medium capitalize">{plan}</span>
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="w-full sm:w-auto">
              Maybe Later
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/settings?tab=billing">
                View Plans & Upgrade
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
