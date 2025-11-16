import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OrganizationSettingsForm } from "@/components/organization-settings-form";
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

  const featureAccess = await checkFeatureAccess("org_sharing");

  if (!featureAccess.hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's information
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Practice Plan Required</CardTitle>
                <CardDescription>
                  Organization settings require the Practice plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upgrade to the Practice plan to manage organization settings and
              collaborate with your team.
            </p>
            <div className="flex gap-4">
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
