import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OrganizationSettingsForm } from "@/components/organization-settings-form";

export default async function OrganizationSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is part of an organization and has admin/owner role
  const { data: membership } = await supabase
    .from("organization_members")
    .select(
      `
      *,
      organizations (
        id,
        name,
        description,
        logo_url,
        created_at
      )
    `
    )
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .single();

  if (!membership) {
    redirect("/dashboard/organization");
  }

  const isAdmin = membership.role === "owner" || membership.role === "admin";

  if (!isAdmin) {
    redirect("/dashboard/organization");
  }

  const organization = membership.organizations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization's information and preferences
        </p>
      </div>

      <OrganizationSettingsForm organization={organization} />
    </div>
  );
}
