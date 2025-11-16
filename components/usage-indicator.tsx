"use client";

import { useUsageLimits } from "@/hooks/use-subscription";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageIndicatorProps {
  type: "clients" | "sessions";
  className?: string;
  showLabel?: boolean;
  variant?: "minimal" | "detailed";
}

export function UsageIndicator({
  type,
  className,
  showLabel = true,
  variant = "minimal",
}: UsageIndicatorProps) {
  const { usage, limits, getPercentage, isAtLimit, loading } = useUsageLimits();

  if (loading) {
    return (
      <div
        className={cn("animate-pulse bg-muted rounded h-6 w-24", className)}
      />
    );
  }

  const current = usage[type];
  const limit = limits[type];
  const percentage = getPercentage(type);
  const atLimit = isAtLimit(type);
  const isUnlimited = limit === Number.POSITIVE_INFINITY;

  if (variant === "minimal") {
    return (
      <Badge
        variant={atLimit ? "destructive" : "secondary"}
        className={cn("gap-1", className)}>
        {atLimit && <AlertCircle className="h-3 w-3" />}
        {current} / {isUnlimited ? "∞" : limit} {showLabel && type}
      </Badge>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {isUnlimited ? (
        <div className="flex items-center justify-between">
          <span className="font-medium capitalize text-sm">{type}</span>
          <Badge variant="secondary" className="font-normal">
            Unlimited
          </Badge>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium capitalize">{type}</span>
            <span className={cn(atLimit && "text-destructive font-medium")}>
              {current} / {limit}
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn(
              "h-2",
              percentage >= 90 && "bg-red-100 dark:bg-red-950"
            )}
            indicatorClassName={cn(
              percentage >= 90 && "bg-destructive",
              percentage >= 75 && percentage < 90 && "bg-amber-500",
              percentage < 75 && "bg-primary"
            )}
          />
          {atLimit && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              You've reached your limit
            </p>
          )}
        </>
      )}
    </div>
  );
}
