"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  PLANS,
  hasFeature,
  isWithinLimit,
  getUsagePercentage,
  type FeatureKey,
  type PlanType,
} from "@/utils/plans";
import type {
  Organization,
  PlanUsage,
  SubscriptionAccess,
  UsageLimits,
} from "@/lib/types/subscription";

/**
 * Hook to access subscription information and feature flags
 */
export function useSubscriptionAccess(): SubscriptionAccess {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("therapist_id", user.id)
        .maybeSingle();

      if (!membership) {
        setLoading(false);
        return;
      }

      setRole(membership.role);

      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", membership.organization_id)
        .maybeSingle();

      setOrganization(org as Organization);
      setLoading(false);

      const channel = supabase
        .channel("subscription-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "organizations",
            filter: `id=eq.${membership.organization_id}`,
          },
          (payload) => {
            setOrganization(payload.new as Organization);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadSubscription();
  }, []);

  const checkFeature = (feature: FeatureKey): boolean => {
    if (!organization) return false;
    if (
      organization.subscription_status !== "active" &&
      organization.subscription_status !== "trial"
    ) {
      return false;
    }
    return hasFeature(organization.plan, feature);
  };

  const currentPlan: PlanType = organization?.plan || "free";

  return {
    organization,
    loading,
    hasFeature: checkFeature,
    plan: currentPlan,
    planConfig: PLANS[currentPlan],
    subscriptionStatus: organization?.subscription_status || null,
    isActive:
      organization?.subscription_status === "active" ||
      organization?.subscription_status === "trial",
    role,
  };
}

/**
 * Hook to get current usage and limits
 */
export function useUsageLimits(): UsageLimits {
  const [usage, setUsage] = useState<PlanUsage>({
    clients: 0,
    sessions: 0,
    members: 0,
  });
  const [loading, setLoading] = useState(true);
  const { organization } = useSubscriptionAccess();

  useEffect(() => {
    async function loadUsage() {
      if (!organization) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase.rpc("get_organization_usage", {
        p_organization_id: organization.id,
      });

      if (error) {
        console.error("[v0] Error fetching usage:", error);
        setLoading(false);
        return;
      }

      setUsage(data);
      setLoading(false);

      const channel = supabase
        .channel("usage-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "client_assignments",
            filter: `organization_id=eq.${organization.id}`,
          },
          () => {
            loadUsage();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sessions",
          },
          () => {
            loadUsage();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "organization_members",
            filter: `organization_id=eq.${organization.id}`,
          },
          () => {
            loadUsage();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadUsage();
  }, [organization]);

  const plan: PlanType = organization?.plan || "free";
  const limits = PLANS[plan].limits;

  return {
    clients: {
      current: usage.clients,
      limit: limits.clients,
      isUnlimited: limits.clients === Infinity,
      plan,
    },
    sessions: {
      current: usage.sessions,
      limit: limits.sessions,
      isUnlimited: limits.sessions === Infinity,
      plan,
    },
    usage,
    limits,
    isLoading: loading,
    isAtLimit: (type: "clients" | "sessions") =>
      !isWithinLimit(plan, type, usage[type]),
    getPercentage: (type: "clients" | "sessions") =>
      getUsagePercentage(plan, type, usage[type]),
    canAddMore: (type: "clients" | "sessions") =>
      isWithinLimit(plan, type, usage[type] + 1),
  };
}
