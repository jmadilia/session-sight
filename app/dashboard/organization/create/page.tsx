import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NewOrganizationForm } from "@/components/new-organization-form";

export default async function CreateOrganizationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already has an organization
  const { data: existingMembership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .single();

  // If they already have an organization, redirect to the organization page
  if (existingMembership) {
    redirect("/dashboard/organization");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Organization
        </h1>
        <p className="text-muted-foreground mt-2">
          Set up your organization to start collaborating with your team
        </p>
      </div>

      <NewOrganizationForm userId={user.id} />
    </div>
  );
}
