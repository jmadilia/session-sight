import { createClient } from "@/utils/supabase/server";
import { PLANS, hasFeature, isWithinLimit, type FeatureKey } from "./plans";
import type {
  Organization,
  PlanUsage,
  FeatureAccessResult,
  UsageLimitResult,
} from "@/lib/types/subscription";

/**
 * Get organization and subscription data for the current user
 */
export async function getOrganizationSubscription(): Promise<Organization | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[v0] getOrganizationSubscription - No user found");
    return null;
  }

  console.log(
    "[v0] getOrganizationSubscription - Fetching org membership for user:",
    user.id
  );

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("therapist_id", user.id)
    .maybeSingle();

  console.log(
    "[v0] getOrganizationSubscription - Membership result:",
    membership,
    "Error:",
    membershipError
  );

  if (!membership) {
    console.log("[v0] getOrganizationSubscription - No membership found");
    return null;
  }

  console.log(
    "[v0] getOrganizationSubscription - Fetching organization:",
    membership.organization_id
  );

  // Get organization with subscription details
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  console.log(
    "[v0] getOrganizationSubscription - Organization result:",
    org,
    "Error:",
    orgError
  );

  return org as Organization;
}

/**
 * Get current usage statistics for an organization
 */
export async function getOrganizationUsage(
  organizationId: string
): Promise<PlanUsage> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_organization_usage", {
    p_organization_id: organizationId,
  });

  if (error) {
    console.error("[v0] Error fetching organization usage:", error);
    return {
      clients: 0,
      sessions: 0,
      members: 0,
    };
  }

  return data;
}

/**
 * Check if the organization has access to a specific feature
 */
export async function checkFeatureAccess(
  feature: FeatureKey
): Promise<FeatureAccessResult> {
  const org = await getOrganizationSubscription();

  if (!org) {
    return {
      hasAccess: false,
      reason: "no_organization",
      requiresUpgrade: true,
    };
  }

  // Check if subscription is active
  if (
    org.subscription_status !== "active" &&
    org.subscription_status !== "trial"
  ) {
    return {
      hasAccess: false,
      reason: "inactive_subscription",
      currentPlan: org.plan,
      requiresUpgrade: true,
    };
  }

  const access = hasFeature(org.plan, feature);

  if (!access) {
    return {
      hasAccess: false,
      reason: "feature_not_included",
      currentPlan: org.plan,
      requiresUpgrade: true,
      suggestedPlan: feature === "multi_user" ? "practice" : "pro",
    };
  }

  return {
    hasAccess: true,
    currentPlan: org.plan,
  };
}

/**
 * Check if the organization is within usage limits
 */
export async function checkUsageLimit(
  limitType: "clients" | "sessions",
  userId: string
): Promise<UsageLimitResult & { organizationId?: string }> {
  const org = await getOrganizationSubscription();

  if (!org) {
    return {
      withinLimit: false,
      reason: "no_organization",
      requiresUpgrade: true,
    };
  }

  const usage = await getOrganizationUsage(org.id);
  const currentUsage = usage[limitType];
  const limit = PLANS[org.plan].limits[limitType];

  const within = isWithinLimit(org.plan, limitType, currentUsage);

  if (!within) {
    return {
      withinLimit: false,
      reason: "plan_limit",
      currentUsage,
      limit,
      currentPlan: org.plan,
      requiresUpgrade: true,
      suggestedPlan: "pro",
      organizationId: org.id,
    };
  }

  return {
    withinLimit: true,
    currentUsage,
    limit,
    currentPlan: org.plan,
    organizationId: org.id,
  };
}

/**
 * Middleware wrapper for API routes that require feature access
 */
export function withFeatureAccess(feature: FeatureKey) {
  // Typed feature parameter
  return async (handler: () => Promise<Response>): Promise<Response> => {
    const access = await checkFeatureAccess(feature);

    if (!access.hasAccess) {
      return Response.json(
        {
          error: access.reason,
          requiresUpgrade: access.requiresUpgrade,
          currentPlan: access.currentPlan,
          suggestedPlan: access.suggestedPlan,
        },
        { status: 403 }
      );
    }

    return handler();
  };
}

/**
 * Middleware wrapper for API routes that require usage limit checks
 */
export function withUsageLimit(limitType: "clients" | "sessions") {
  return async (
    handler: () => Promise<Response>,
    userId: string
  ): Promise<Response> => {
    const limitCheck = await checkUsageLimit(limitType, userId);

    if (!limitCheck.withinLimit) {
      return Response.json(
        {
          error: limitCheck.reason,
          requiresUpgrade: limitCheck.requiresUpgrade,
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
          currentPlan: limitCheck.currentPlan,
          suggestedPlan: limitCheck.suggestedPlan,
          organizationId: limitCheck.organizationId,
        },
        { status: 403 }
      );
    }

    return handler();
  };
}
