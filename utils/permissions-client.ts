// Client-side permission utilities
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
  ],
  supervisor: [
    "view_all_clients",
    "view_all_sessions",
    "view_team_analytics",
    "schedule_appointments",
    "view_all_appointments",
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

export function hasPermission(
  role: Role | null,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) || false;
}

export function isAdmin(role: Role | null): boolean {
  return role === "owner" || role === "admin";
}

export function canManageClients(role: Role | null): boolean {
  return (
    hasPermission(role, "manage_all_clients") ||
    hasPermission(role, "manage_assigned_clients")
  );
}

export function canViewAllData(role: Role | null): boolean {
  return role === "owner" || role === "admin" || role === "supervisor";
}
