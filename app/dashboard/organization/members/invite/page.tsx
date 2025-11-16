import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InviteMemberForm } from "@/components/invite-member-form";
import { checkFeatureAccess } from "@/utils/subscription-access";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

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

  const featureAccess = await checkFeatureAccess("multi_user");

  if (!featureAccess.hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Invite Team Member
          </h1>
          <p className="text-muted-foreground mt-2">
            Add team members to your organization
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Upgrade to Practice Plan</CardTitle>
                <CardDescription>
                  Multi-user access requires the Practice plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your current plan doesn't include multi-user access. Upgrade to
              the Practice plan to:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400">✓</span>
                Add unlimited team members
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400">✓</span>
                Assign different roles and permissions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400">✓</span>
                Share clients across your organization
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400">✓</span>
                View practice-wide analytics
              </li>
            </ul>
            <div className="flex gap-4 pt-4">
              <Button
                asChild
                className="bg-gradient-to-r from-teal-500 to-blue-600">
                <Link href="/dashboard/settings?tab=billing">
                  Upgrade to Practice
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/organization">Back to Organization</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
