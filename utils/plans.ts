/**
 * Centralized Subscription Plans Configuration
 * Defines all plan tiers, limits, and feature access for Session Sight
 */

export type PlanType = "free" | "pro" | "practice";
export type SubscriptionStatus =
  | "active"
  | "trial"
  | "expired"
  | "cancelled"
  | "past_due";

export type FeatureKey =
  // Core Features (Available to all)
  | "client_management"
  | "session_tracking"
  | "appointments"
  | "basic_analytics"
  | "basic_treatment_plans"
  | "progress_notes"

  // Pro Features
  | "unlimited_clients"
  | "unlimited_sessions"
  | "advanced_analytics"
  | "early_warning_system"
  | "calendar_sync"
  | "unlimited_treatment_plans"
  | "custom_notes_templates"
  | "export_reports"
  | "client_portal"

  // Practice Features
  | "multi_user"
  | "org_sharing"
  | "team_roles"
  | "team_analytics"
  | "billing_reports"
  | "admin_dashboard";

export interface PlanLimits {
  clients: number;
  sessions: number; // Per month
  teamMembers: number;
  storage: number; // In MB
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  limits: PlanLimits;
  features: FeatureKey[];
  highlighted?: boolean;
}

/**
 * Plan Definitions
 */
export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    description: "Perfect for getting started with basic client management",
    price: {
      monthly: 0,
      annual: 0,
    },
    limits: {
      clients: 10,
      sessions: 25, // Per month
      teamMembers: 1,
      storage: 100, // 100 MB
    },
    features: [
      "client_management",
      "session_tracking",
      "appointments",
      "basic_analytics",
      "basic_treatment_plans",
      "progress_notes",
    ],
  },
  pro: {
    id: "pro",
    name: "Professional",
    description: "For individual therapists managing a full practice",
    price: {
      monthly: 29,
      annual: 290, // ~$24/month
    },
    limits: {
      clients: Number.POSITIVE_INFINITY,
      sessions: Number.POSITIVE_INFINITY,
      teamMembers: 1,
      storage: 5000, // 5 GB
    },
    features: [
      // All free features
      "client_management",
      "session_tracking",
      "appointments",
      "basic_analytics",
      "basic_treatment_plans",
      "progress_notes",
      // Pro features
      "unlimited_clients",
      "unlimited_sessions",
      "advanced_analytics",
      "early_warning_system",
      "calendar_sync",
      "unlimited_treatment_plans",
      "custom_notes_templates",
      "export_reports",
      "client_portal",
    ],
    highlighted: true,
  },
  practice: {
    id: "practice",
    name: "Practice",
    description: "For group practices and clinics with multiple therapists",
    price: {
      monthly: 99,
      annual: 990, // ~$82.50/month
    },
    limits: {
      clients: Number.POSITIVE_INFINITY,
      sessions: Number.POSITIVE_INFINITY,
      teamMembers: Number.POSITIVE_INFINITY,
      storage: 50000, // 50 GB
    },
    features: [
      // All pro features
      "client_management",
      "session_tracking",
      "appointments",
      "basic_analytics",
      "basic_treatment_plans",
      "progress_notes",
      "unlimited_clients",
      "unlimited_sessions",
      "advanced_analytics",
      "early_warning_system",
      "calendar_sync",
      "unlimited_treatment_plans",
      "custom_notes_templates",
      "export_reports",
      "client_portal",
      // Practice features
      "multi_user",
      "org_sharing",
      "team_roles",
      "team_analytics",
      "billing_reports",
      "admin_dashboard",
    ],
  },
};

/**
 * Feature Display Names and Descriptions
 */
export const FEATURE_INFO: Record<
  FeatureKey,
  { name: string; description: string }
> = {
  // Core Features
  client_management: {
    name: "Client Management",
    description: "Organize and track all your clients in one place",
  },
  session_tracking: {
    name: "Session Tracking",
    description: "Record and manage therapy sessions",
  },
  appointments: {
    name: "Appointments",
    description: "Schedule and manage appointments",
  },
  basic_analytics: {
    name: "Basic Analytics",
    description: "View essential practice metrics and insights",
  },
  basic_treatment_plans: {
    name: "Basic Treatment Plans",
    description: "Create simple treatment plans for clients",
  },
  progress_notes: {
    name: "Progress Notes",
    description: "Document client progress and session notes",
  },

  // Pro Features
  unlimited_clients: {
    name: "Unlimited Clients",
    description: "No limits on the number of clients you can manage",
  },
  unlimited_sessions: {
    name: "Unlimited Sessions",
    description: "Track unlimited sessions per month",
  },
  advanced_analytics: {
    name: "Advanced Analytics",
    description: "Deep insights with predictive analytics and trends",
  },
  early_warning_system: {
    name: "Early Warning System",
    description: "Get alerts for at-risk clients and engagement issues",
  },
  calendar_sync: {
    name: "Calendar Sync",
    description: "Sync with Google Calendar and Outlook",
  },
  unlimited_treatment_plans: {
    name: "Unlimited Treatment Plans",
    description: "Create comprehensive, unlimited treatment plans",
  },
  custom_notes_templates: {
    name: "Custom Note Templates",
    description: "Create and save your own note templates",
  },
  export_reports: {
    name: "Export Reports",
    description: "Export data and generate custom reports",
  },
  client_portal: {
    name: "Client Portal",
    description: "Give clients secure access to their information",
  },

  // Practice Features
  multi_user: {
    name: "Multi-User Access",
    description: "Add unlimited team members to your practice",
  },
  org_sharing: {
    name: "Organization Sharing",
    description: "Share clients and data across your practice",
  },
  team_roles: {
    name: "Team Roles & Permissions",
    description: "Manage access levels for different team members",
  },
  team_analytics: {
    name: "Team Analytics",
    description: "View practice-wide analytics across all therapists",
  },
  billing_reports: {
    name: "Billing Reports",
    description: "Generate billing and insurance reports",
  },
  admin_dashboard: {
    name: "Admin Dashboard",
    description: "Centralized dashboard for practice administrators",
  },
};

/**
 * Helper Functions
 */

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeature(plan: PlanType, feature: FeatureKey): boolean {
  return PLANS[plan].features.includes(feature);
}

/**
 * Check if a plan has a specific limit
 */
export function getLimit(plan: PlanType, limitType: keyof PlanLimits): number {
  return PLANS[plan].limits[limitType];
}

/**
 * Check if a usage count is within the plan's limit
 */
export function isWithinLimit(
  plan: PlanType,
  limitType: keyof PlanLimits,
  currentUsage: number
): boolean {
  const limit = getLimit(plan, limitType);
  return limit === Number.POSITIVE_INFINITY || currentUsage < limit;
}

/**
 * Get the percentage of a limit that's been used
 */
export function getUsagePercentage(
  plan: PlanType,
  limitType: keyof PlanLimits,
  currentUsage: number
): number {
  const limit = getLimit(plan, limitType);
  if (limit === Number.POSITIVE_INFINITY) return 0;
  return Math.min(100, (currentUsage / limit) * 100);
}

/**
 * Check if a plan is considered "active" for feature access
 */
export function isPlanActive(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trial";
}

/**
 * Get upgrade path suggestions
 */
export function getUpgradePath(currentPlan: PlanType): PlanType | null {
  if (currentPlan === "free") return "pro";
  if (currentPlan === "pro") return "practice";
  return null; // Already on highest plan
}

/**
 * Get all features that would be unlocked by upgrading
 */
export function getUpgradeFeatures(
  currentPlan: PlanType,
  targetPlan: PlanType
): FeatureKey[] {
  const currentFeatures = PLANS[currentPlan].features;
  const targetFeatures = PLANS[targetPlan].features;
  return targetFeatures.filter((feature) => !currentFeatures.includes(feature));
}

/**
 * Calculate savings for annual billing
 */
export function getAnnualSavings(plan: PlanType): number {
  const monthly = PLANS[plan].price.monthly * 12;
  const annual = PLANS[plan].price.annual;
  return monthly - annual;
}
