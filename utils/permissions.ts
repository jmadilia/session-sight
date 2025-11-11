import { createClient } from "@/utils/supabase/server";

export type Role = "owner" | "admin" | "supervisor" | "therapist" | "assistant";

export type Permission =
  | "manage_organization"
  | "invite_members"
  | "remove_members"
  | "view_all_clients"
  | "manage_all_clients"
  | "view_assigned_clients"
  | "manage_assigned_clients"
  | "view_all_sessions"
  | "manage_all_sessions"
  | "view_assigned_sessions"
  | "manage_assigned_sessions"
  | "view_all_analytics"
  | "view_team_analytics"
  | "view_own_analytics"
  | "schedule_appointments"
  | "view_all_appointments"
  | "view_assigned_appointments";

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    "manage_organization",
    "invite_members",
    "remove_members",
    "view_all_clients",
    "manage_all_clients",
    "view_all_sessions",
    "manage_all_sessions",
    "view_all_analytics",
    "schedule_appointments",
    "view_all_appointments",
    "view_assigned_appointments",
  ],
  admin: [
    "manage_organization",
    "invite_members",
    "remove_members",
    "view_all_clients",
    "manage_all_clients",
    "view_all_sessions",
    "manage_all_sessions",
    "view_all_analytics",
    "schedule_appointments",
    "view_all_appointments",
    "view_assigned_appointments",
  ],
  supervisor: [
    "view_all_clients",
    "view_all_sessions",
    "view_team_analytics",
    "schedule_appointments",
    "view_all_appointments",
    "view_assigned_appointments",
  ],
  therapist: [
    "view_assigned_clients",
    "manage_assigned_clients",
    "view_assigned_sessions",
    "manage_assigned_sessions",
    "view_own_analytics",
    "schedule_appointments",
    "view_assigned_appointments",
  ],
  assistant: [
    "view_assigned_clients",
    "schedule_appointments",
    "view_assigned_appointments",
  ],
};

export interface UserOrgContext {
  userId: string;
  organizationId: string | null;
  role: Role | null;
  isInOrganization: boolean;
}

/**
 * Get the user's organization context including their role
 */
export async function getUserOrgContext(
  userId: string
): Promise<UserOrgContext> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_organization_context", {
    p_user_id: userId,
  });

  console.log("[v0] getUserOrgContext - userId:", userId);
  console.log("[v0] getUserOrgContext - rpc result:", data);
  console.log("[v0] getUserOrgContext - rpc error:", error);

  // The function returns an array with one result or empty array
  const membership = data && data.length > 0 ? data[0] : null;

  return {
    userId,
    organizationId: membership?.organization_id || null,
    role: (membership?.role as Role) || null,
    isInOrganization: !!membership && membership.status === "active",
  };
}

/**
 * Check if a user has a specific permission based on their role
 */
export function hasPermission(
  role: Role | null,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Check if a user can perform an action (shorthand helper)
 */
export async function canUserPerform(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const context = await getUserOrgContext(userId);
  return hasPermission(context.role, permission);
}

/**
 * Get all therapist IDs that a user can access based on their role
 * - Owners/Admins: All therapists in the organization
 * - Supervisors: All therapists they supervise (to be implemented with supervisor assignments)
 * - Therapists: Only themselves
 * - Assistants: Therapists they assist (to be implemented with assistant assignments)
 */
export async function getAccessibleTherapistIds(
  userId: string
): Promise<string[]> {
  const context = await getUserOrgContext(userId);

  console.log("[v0] getAccessibleTherapistIds - userId:", userId);
  console.log("[v0] getAccessibleTherapistIds - context:", context);

  if (!context.isInOrganization) {
    // Not in an organization, can only access their own data
    console.log("[v0] getAccessibleTherapistIds - not in org, returning:", [
      userId,
    ]);
    return [userId];
  }

  const supabase = await createClient();

  // Owners and Admins can see all therapists in the organization
  if (context.role === "owner" || context.role === "admin") {
    const { data: members, error } = await supabase.rpc(
      "get_organization_therapist_ids",
      {
        p_organization_id: context.organizationId!,
      }
    );

    console.log(
      "[v0] getAccessibleTherapistIds - admin/owner members:",
      members
    );
    console.log("[v0] getAccessibleTherapistIds - admin/owner error:", error);

    if (error || !members || members.length === 0) {
      return [userId];
    }

    return members.map((m: { therapist_id: string }) => m.therapist_id);
  }

  // Supervisors can see their supervised therapists
  // TODO: Implement supervisor_assignments table for specific assignments
  if (context.role === "supervisor") {
    const { data: members, error } = await supabase.rpc(
      "get_supervised_therapist_ids",
      {
        p_user_id: userId,
        p_organization_id: context.organizationId!,
      }
    );

    console.log(
      "[v0] getAccessibleTherapistIds - supervisor members:",
      members
    );
    console.log("[v0] getAccessibleTherapistIds - supervisor error:", error);

    const supervisedIds =
      error || !members
        ? []
        : members.map((m: { therapist_id: string }) => m.therapist_id);
    const allAccessibleIds = [
      userId,
      ...supervisedIds.filter((id: string) => id !== userId),
    ];

    console.log(
      "[v0] getAccessibleTherapistIds - supervisor accessible IDs:",
      allAccessibleIds
    );

    return allAccessibleIds;
  }

  // Therapists and Assistants can only see their own data
  console.log(
    "[v0] getAccessibleTherapistIds - therapist/assistant, returning:",
    [userId]
  );
  return [userId];
}

/**
 * Check if user can access a specific client
 */
export async function canAccessClient(
  userId: string,
  clientId: string
): Promise<boolean> {
  const accessibleTherapistIds = await getAccessibleTherapistIds(userId);
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("therapist_id")
    .eq("id", clientId)
    .maybeSingle();

  if (!client) return false;

  return accessibleTherapistIds.includes(client.therapist_id);
}

/**
 * Check if user can access a specific session
 */
export async function canAccessSession(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const accessibleTherapistIds = await getAccessibleTherapistIds(userId);
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("therapist_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) return false;

  return accessibleTherapistIds.includes(session.therapist_id);
}

/**
 * Check if user can access a specific appointment
 */
export async function canAccessAppointment(
  userId: string,
  appointmentId: string
): Promise<boolean> {
  const accessibleTherapistIds = await getAccessibleTherapistIds(userId);
  const supabase = await createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("therapist_id")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appointment) return false;

  return accessibleTherapistIds.includes(appointment.therapist_id);
}
