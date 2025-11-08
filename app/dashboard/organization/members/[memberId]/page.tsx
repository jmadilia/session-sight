import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ManageMemberForm } from "@/components/manage-member-form";

export default async function ManageMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get the member being managed
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select(
      `
      *,
      organizations (
        id,
        name
      ),
      therapists!organization_members_therapist_id_fkey (
        id,
        practice_name
      )
    `
    )
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    redirect("/dashboard/organization");
  }

  // Get the profile of the member being managed
  const { data: memberProfile } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", member.therapist_id)
    .single();

  // Check if current user is admin of this organization
  const { data: currentMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("therapist_id", user.id)
    .eq("organization_id", member.organization_id)
    .eq("status", "active")
    .single();

  const isAdmin =
    currentMembership?.role === "owner" || currentMembership?.role === "admin";

  if (!isAdmin) {
    redirect("/dashboard/organization");
  }

  // Can't manage yourself
  if (member.therapist_id === user.id) {
    redirect("/dashboard/organization");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/organization">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organization
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Team Member
        </h1>
        <p className="text-muted-foreground mt-2">
          Update role or remove member from your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>
            Current details for this team member
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-lg">{memberProfile?.full_name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{memberProfile?.email || "Unknown"}</p>
          </div>
          {member.therapists?.practice_name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Practice
              </p>
              <p className="text-lg">{member.therapists.practice_name}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current Role
            </p>
            <p className="text-lg capitalize">{member.role}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Joined</p>
            <p className="text-lg">
              {new Date(member.joined_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <ManageMemberForm
        memberId={member.id}
        memberName={memberProfile?.full_name || "this member"}
        currentRole={member.role}
        organizationId={member.organization_id}
        isOwner={member.role === "owner"}
      />
    </div>
  );
}
