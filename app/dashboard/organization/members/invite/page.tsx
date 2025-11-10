import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InviteMemberForm } from "@/components/invite-member-form";

export default async function InviteMemberPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is part of an organization and has admin/owner role
  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select(
      `
      *,
      organizations (
        id,
        name,
        description
      )
    `
    )
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .single();

  if (!membership || membershipError) {
    redirect("/dashboard/organization");
  }

  const isAdmin = membership.role === "owner" || membership.role === "admin";

  if (!isAdmin) {
    redirect("/dashboard/organization");
  }

  const organization = membership.organizations as {
    id: string;
    name: string;
    description: string | null;
  } | null;

  if (!organization) {
    redirect("/dashboard/organization");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Invite Team Member
        </h1>
        <p className="text-muted-foreground mt-2">
          Invite a new member to join {organization.name}
        </p>
      </div>

      <InviteMemberForm
        organizationId={organization.id}
        organizationName={organization.name}
        currentUserId={user.id}
      />
    </div>
  );
}
