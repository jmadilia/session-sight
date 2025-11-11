"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface ManageMemberFormProps {
  memberId: string;
  memberName: string;
  currentRole: string;
  currentSupervisedBy: string | null;
  organizationId: string;
  isOwner: boolean;
  availableSupervisors: Array<{
    therapist_id: string;
    full_name: string;
    email: string;
  }>;
}

export function ManageMemberForm({
  memberId,
  memberName,
  currentRole,
  currentSupervisedBy,
  organizationId,
  isOwner,
  availableSupervisors,
}: ManageMemberFormProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [supervisedBy, setSupervisedBy] = useState<string>(
    currentSupervisedBy || "none"
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateRole = async () => {
    if (role === currentRole) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      console.log("[v0] Updating member role:", { memberId, role });

      const response = await fetch("/api/organization/members/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      });

      const data = await response.json();

      console.log("[v0] Update role response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      router.push("/dashboard/organization");
      router.refresh();
    } catch (err) {
      console.error("[v0] Error updating role:", err);
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSupervisor = async () => {
    const newSupervisedBy = supervisedBy === "none" ? null : supervisedBy;
    if (newSupervisedBy === currentSupervisedBy) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      console.log("[v0] Updating supervisor assignment:", {
        memberId,
        supervisedBy: newSupervisedBy,
      });

      const response = await fetch(
        "/api/organization/members/update-supervisor",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, supervisedBy: newSupervisedBy }),
        }
      );

      const data = await response.json();

      console.log("[v0] Update supervisor response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update supervisor");
      }

      router.push("/dashboard/organization");
      router.refresh();
    } catch (err) {
      console.error("[v0] Error updating supervisor:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update supervisor"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async () => {
    setIsRemoving(true);
    setError(null);

    try {
      console.log("[v0] Removing member:", memberId);

      const response = await fetch("/api/organization/members/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      const data = await response.json();

      console.log("[v0] Remove member response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

      router.push("/dashboard/organization");
      router.refresh();
    } catch (err) {
      console.error("[v0] Error removing member:", err);
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const showSupervisorAssignment =
    role === "therapist" && availableSupervisors.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Update Role</CardTitle>
          <CardDescription>
            Change this member's role in the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOwner && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                This member is the organization owner. Only owners can transfer
                ownership to another admin.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isOwner}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admins can invite and manage members. Supervisors can view all
              team data. Therapists manage their own clients. Assistants have
              limited access.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            onClick={handleUpdateRole}
            disabled={isUpdating || role === currentRole || isOwner}
            className="w-full">
            {isUpdating ? "Updating..." : "Update Role"}
          </Button>
        </CardContent>
      </Card>

      {showSupervisorAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>Supervisor Assignment</CardTitle>
            <CardDescription>
              Assign a supervisor to oversee this therapist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supervisor">Assigned Supervisor</Label>
              <Select value={supervisedBy} onValueChange={setSupervisedBy}>
                <SelectTrigger id="supervisor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Supervisor</SelectItem>
                  {availableSupervisors.map((supervisor) => (
                    <SelectItem
                      key={supervisor.therapist_id}
                      value={supervisor.therapist_id}>
                      {supervisor.full_name || supervisor.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Supervisors can view and manage data for therapists they
                oversee.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <Button
              onClick={handleUpdateSupervisor}
              disabled={
                isUpdating ||
                (supervisedBy === "none" ? null : supervisedBy) ===
                  currentSupervisedBy ||
                isOwner
              }
              className="w-full">
              {isUpdating ? "Updating..." : "Update Supervisor"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Remove this member from your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-100">
                The organization owner cannot be removed. Transfer ownership to
                another admin first.
              </p>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isRemoving}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isRemoving ? "Removing..." : "Remove Member"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {memberName} from your organization. They
                    will lose access to all organization data and will need to
                    be re-invited to join again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveMember}
                    className="bg-red-600 hover:bg-red-700">
                    Remove Member
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
