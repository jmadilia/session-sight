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

  console.log("[v0] Fetching member details for therapist:", memberId);
  const { data: memberData, error: memberError } = await supabase.rpc(
    "get_member_details",
    {
      p_therapist_id: memberId,
      p_user_id: user.id,
    }
  );
  console.log("[v0] Member details result:", memberData, "Error:", memberError);

  const member = memberData && memberData.length > 0 ? memberData[0] : null;

  if (memberError || !member) {
    console.log("[v0] Member not found or access denied, redirecting");
    redirect("/dashboard/organization");
  }

  const isAdmin =
    member.current_user_role === "owner" ||
    member.current_user_role === "admin";

  if (!isAdmin) {
    console.log("[v0] User is not admin, redirecting");
    redirect("/dashboard/organization");
  }

  // Can't manage yourself
  if (member.therapist_id === user.id) {
    console.log("[v0] Cannot manage yourself, redirecting");
    redirect("/dashboard/organization");
  }

  console.log(
    "[v0] Fetching supervisors for organization:",
    member.organization_id
  );
  const { data: supervisorsData, error: supervisorsError } = await supabase.rpc(
    "get_organization_therapists",
    {
      p_org_id: member.organization_id,
    }
  );
  console.log(
    "[v0] Supervisors data:",
    supervisorsData,
    "Error:",
    supervisorsError
  );

  const supervisors =
    supervisorsData?.filter(
      (m: any) =>
        m.role === "supervisor" && m.therapist_id !== member.therapist_id
    ) || [];

  console.log("[v0] Filtered supervisors:", supervisors);

  const supervisorIds = supervisors.map((s: any) => s.therapist_id);

  let availableSupervisors: Array<{
    therapist_id: string;
    full_name: string;
    email: string;
  }> = [];

  if (supervisorIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", supervisorIds);

    console.log(
      "[v0] Supervisor profiles:",
      profilesData,
      "Error:",
      profilesError
    );

    const profilesMap = new Map(
      (profilesData || []).map((profile) => [profile.id, profile])
    );

    availableSupervisors = supervisors.map((supervisor: any) => ({
      therapist_id: supervisor.therapist_id,
      full_name: profilesMap.get(supervisor.therapist_id)?.full_name || "",
      email: profilesMap.get(supervisor.therapist_id)?.email || "",
    }));
  }

  console.log(
    "[v0] Available supervisors with profiles:",
    availableSupervisors
  );

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
            <p className="text-lg">{member.full_name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{member.email || "Unknown"}</p>
          </div>
          {member.practice_name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Practice
              </p>
              <p className="text-lg">{member.practice_name}</p>
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
        memberName={member.full_name || "this member"}
        currentRole={member.role}
        currentSupervisedBy={member.supervised_by}
        organizationId={member.organization_id}
        isOwner={member.role === "owner"}
        availableSupervisors={availableSupervisors}
      />
    </div>
  );
}
