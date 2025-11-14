/**
 * TypeScript types for subscription and plan management
 */

import type { PlanType, SubscriptionStatus, FeatureKey } from "@/utils/plans";

export interface Organization {
  id: string;
  name: string;
  plan: PlanType;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanUsage {
  clients: number;
  sessions: number;
  members: number;
}

export interface UsageWithLimits extends PlanUsage {
  limits: {
    clients: number;
    sessions: number;
    teamMembers: number;
    storage: number;
  };
  percentages: {
    clients: number;
    sessions: number;
    teamMembers: number;
    storage: number;
  };
}

export interface SubscriptionInfo {
  organization: Organization;
  usage: UsageWithLimits;
  canUpgrade: boolean;
  nextPlan: PlanType | null;
  isExpired: boolean;
  daysUntilExpiration: number | null;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  reason?:
    | "plan_limit"
    | "expired"
    | "feature_not_included"
    | "no_organization"
    | "inactive_subscription"
    | string; // Added more reason types
  requiresUpgrade?: boolean;
  currentPlan?: PlanType;
  suggestedPlan?: PlanType;
}

export interface UsageLimitResult {
  withinLimit: boolean; // Changed from 'allowed' to 'withinLimit'
  reason?: string;
  current?: number; // Changed from required to optional
  currentUsage?: number; // Added currentUsage
  limit?: number; // Changed from required to optional
  percentage?: number;
  requiresUpgrade?: boolean;
  currentPlan?: PlanType;
  suggestedPlan?: PlanType;
}

export interface SubscriptionAccess {
  organization: Organization | null;
  loading: boolean;
  hasFeature: (feature: FeatureKey) => boolean;
  plan: PlanType;
  planConfig: any;
  subscriptionStatus: SubscriptionStatus | null;
  isActive: boolean;
}

export interface UsageLimits {
  usage: PlanUsage;
  limits: {
    clients: number;
    sessions: number;
    teamMembers: number;
    storage: number;
  };
  loading: boolean;
  isAtLimit: (type: "clients" | "sessions") => boolean;
  getPercentage: (type: "clients" | "sessions") => number;
  canAddMore: (type: "clients" | "sessions") => boolean;
}
