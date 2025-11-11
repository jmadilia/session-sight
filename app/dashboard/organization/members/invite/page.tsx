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

  console.log("[v0] INVITE PAGE - Fetching user context for user:", user.id);

  const { data: contextData, error: contextError } = await supabase.rpc(
    "get_user_organization_context",
    {
      p_user_id: user.id,
    }
  );

  console.log("[v0] INVITE PAGE - User context result:", contextData);
  console.log("[v0] INVITE PAGE - User context error:", contextError);

  if (contextError) {
    console.log("[v0] INVITE PAGE - Context error, redirecting");
    redirect("/dashboard/organization");
  }

  if (!contextData || !Array.isArray(contextData) || contextData.length === 0) {
    console.log("[v0] INVITE PAGE - No context data, redirecting");
    redirect("/dashboard/organization");
  }

  const context = contextData[0];

  console.log("[v0] INVITE PAGE - Parsed context:", context);
  console.log("[v0] INVITE PAGE - User role:", context.role);
  console.log("[v0] INVITE PAGE - Organization ID:", context.organization_id);

  const isAdmin = context.role === "owner" || context.role === "admin";

  if (!isAdmin) {
    console.log("[v0] INVITE PAGE - Not admin, redirecting");
    redirect("/dashboard/organization");
  }

  // Fetch organization details
  console.log(
    "[v0] INVITE PAGE - Fetching organization details for:",
    context.organization_id
  );

  const { data: orgData, error: orgError } = await supabase.rpc(
    "get_organization_details",
    {
      p_user_id: user.id,
    }
  );

  console.log("[v0] INVITE PAGE - Organization result:", orgData);
  console.log("[v0] INVITE PAGE - Organization error:", orgError);

  if (orgError) {
    console.log("[v0] INVITE PAGE - Organization error:", orgError.message);
    redirect("/dashboard/organization");
  }

  if (!orgData || !Array.isArray(orgData) || orgData.length === 0) {
    console.log("[v0] INVITE PAGE - No organization data found");
    redirect("/dashboard/organization");
  }

  const organization = orgData[0];

  console.log(
    "[v0] INVITE PAGE - Successfully loaded, organization:",
    organization.name
  );

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
