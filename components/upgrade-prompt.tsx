"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PLANS,
  type PlanType,
  FEATURE_INFO,
  type FeatureKey,
} from "@/utils/plans";
import { AlertCircle, Zap, Lock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  currentPlan: PlanType;
  suggestedPlan?: PlanType;
  variant?: "inline" | "modal" | "banner";
  featureName?: string;
  featureDescription?: string;
}

export function UpgradePrompt({
  feature,
  currentPlan,
  suggestedPlan = "pro",
  variant = "inline",
  featureName,
  featureDescription,
}: UpgradePromptProps) {
  const [showModal, setShowModal] = useState(variant === "modal");
  const suggestedPlanConfig = PLANS[suggestedPlan];
  const currentPlanConfig = PLANS[currentPlan];

  // Get feature info
  const featureKey = feature as FeatureKey;
  const featureInfo = FEATURE_INFO[featureKey] || {
    name: featureName || "This feature",
    description: featureDescription || "",
  };

  if (variant === "banner") {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <Zap className="h-4 w-4 text-amber-600" />
        <AlertTitle>Upgrade to unlock {featureInfo.name}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{featureInfo.description}</span>
          <Button size="sm" asChild>
            <Link href="/dashboard/settings?tab=billing">Upgrade Now</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "modal") {
    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-600" />
              {featureInfo.name} - Upgrade Required
            </DialogTitle>
            <DialogDescription>{featureInfo.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">{suggestedPlanConfig.name}</h4>
              <p className="text-2xl font-bold mb-1">
                ${suggestedPlanConfig.price.monthly}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {suggestedPlanConfig.description}
              </p>
              <ul className="space-y-2 text-sm">
                {suggestedPlanConfig.features
                  .slice(0, 5)
                  .map((feat: FeatureKey, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{FEATURE_INFO[feat].name}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/dashboard/settings?tab=billing">
                Upgrade to {suggestedPlanConfig.name}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Inline variant - more compact and contextual
  return (
    <div className="rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Lock className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-medium text-sm">{featureInfo.name}</h4>
            <p className="text-xs text-muted-foreground">
              {featureInfo.description}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Available on the{" "}
            <span className="font-medium">{suggestedPlanConfig.name}</span> plan
          </p>
          <Button size="sm" variant="default" asChild>
            <Link href="/dashboard/settings?tab=billing">
              Upgrade to Unlock
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
