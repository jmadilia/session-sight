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
import { Users, Settings, UserPlus, Building2 } from "lucide-react";
import Link from "next/link";
import { InvitationCard } from "@/components/invitation-card";

type MemberProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type MemberTherapist = {
  id: string;
  practice_name: string | null;
  specialization: string | null;
  phone: string | null;
};

type OrganizationMember = {
  id: string;
  therapist_id: string;
  role: string;
  status: string;
};

export default async function OrganizationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  console.log("[v0] Fetching pending invitations for user:", user.id);
  const { data: pendingInvitationsData, error: invitationsError } =
    await supabase.rpc("get_pending_invitations", {
      p_user_id: user.id,
    });
  console.log(
    "[v0] Pending invitations result:",
    pendingInvitationsData,
    "Error:",
    invitationsError
  );

  const pendingInvitations = pendingInvitationsData || [];

  console.log("[v0] Fetching user context for user:", user.id);
  const { data: contextData, error: contextError } = await supabase.rpc(
    "get_user_organization_context",
    {
      p_user_id: user.id,
    }
  );
  console.log("[v0] User context result:", contextData, "Error:", contextError);

  const userContext =
    contextData && contextData.length > 0 ? contextData[0] : null;
  console.log("[v0] Parsed user context:", userContext);

  const validInvitations = pendingInvitations.filter(
    (inv: any) => inv.organization_name !== null
  );

  if (validInvitations.length > 0 && !userContext?.organization_id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Invitations
          </h1>
          <p className="text-muted-foreground mt-2">
            You have pending invitations to join organizations
          </p>
        </div>

        <div className="grid gap-4 max-w-2xl">
          {validInvitations.map((invitation: any) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
          ))}
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Or Create Your Own Organization</CardTitle>
            <CardDescription>
              Start your own organization and invite your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/organization/create">
                <Building2 className="w-4 h-4 mr-2" />
                Create Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no organization, show create organization UI
  if (!userContext?.organization_id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
          <p className="text-muted-foreground mt-2">
            Create or join an organization to collaborate with your team
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>No Organization Yet</CardTitle>
                <CardDescription>
                  Start collaborating with your team by creating an organization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Organizations allow you to manage multiple therapists, share
              clients, assign tasks, and collaborate effectively as a team.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
              <Link href="/dashboard/organization/create">
                <Building2 className="w-4 h-4 mr-2" />
                Create Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("[v0] Fetching organization:", userContext.organization_id);
  const { data: orgData, error: orgError } = await supabase.rpc(
    "get_organization_details",
    {
      p_user_id: user.id,
    }
  );
  console.log("[v0] Organization result:", orgData, "Error:", orgError);

  const organization = orgData && orgData.length > 0 ? orgData[0] : null;

  if (!organization) {
    return <div>Organization not found</div>;
  }

  console.log("[v0] Fetching organization therapists");
  const { data: membersData, error: membersError } = await supabase.rpc(
    "get_organization_therapists",
    {
      p_org_id: userContext.organization_id,
    }
  );
  console.log("[v0] Members result:", membersData, "Error:", membersError);

  const members = membersData || [];

  console.log("[v0] Members data:", members);

  const therapistIds = members.map((m: any) => m.therapist_id);

  console.log("[v0] Therapist IDs:", therapistIds);

  const { data: profiles } = await supabase.rpc(
    "get_organization_member_profiles",
    {
      p_therapist_ids: therapistIds,
    }
  );

  console.log("[v0] Profiles fetched:", profiles);

  const profileMap = new Map<string, MemberProfile>(
    profiles?.map((p: MemberProfile) => [p.id, p]) || []
  );

  const { data: therapists } = await supabase.rpc(
    "get_organization_member_therapists",
    {
      p_therapist_ids: therapistIds,
    }
  );

  console.log("[v0] Therapists fetched:", therapists);

  const therapistMap = new Map<string, MemberTherapist>(
    therapists?.map((t: MemberTherapist) => [t.id, t]) || []
  );

  const isAdmin = userContext.role === "owner" || userContext.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {organization.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            {organization.description || "Manage your team and organization"}
          </p>
        </div>
        {isAdmin && (
          <Button asChild variant="outline">
            <Link href="/dashboard/organization/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {userContext.role}
            </div>
            <p className="text-xs text-muted-foreground">
              In this organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(userContext.joined_at).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Joined organization</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Manage your organization's team members and their roles"
                  : "View your organization's team members and their roles"}
              </CardDescription>
            </div>
            {isAdmin ? (
              <Button asChild>
                <Link href="/dashboard/organization/members/invite">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Link>
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Only admins can invite members
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members?.map((member: any) => {
              const profile = profileMap.get(member.therapist_id);
              const therapist = therapistMap.get(member.therapist_id);
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {profile?.full_name?.charAt(0) ||
                        therapist?.practice_name?.charAt(0) ||
                        "?"}
                    </div>
                    <div>
                      <p className="font-medium">
                        {profile?.full_name || "Unknown Member"}
                      </p>
                      {profile?.email && (
                        <p className="text-sm text-muted-foreground">
                          {profile.email}
                        </p>
                      )}
                      {therapist?.practice_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Practice: {therapist.practice_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 capitalize">
                      {member.role}
                    </span>
                    {isAdmin && member.therapist_id !== user.id && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/organization/members/${member.therapist_id}`}>
                          Manage
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
