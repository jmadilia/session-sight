"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";

interface InviteMemberFormProps {
  organizationId: string;
  organizationName: string;
  currentUserId: string;
}

export function InviteMemberForm({
  organizationId,
  organizationName,
  currentUserId,
}: InviteMemberFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "therapist" as "admin" | "supervisor" | "therapist" | "assistant",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!existingProfile) {
        toast({
          title: "User not found",
          description:
            "No therapist account exists with this email address. They need to sign up first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error: inviteError } = await supabase.rpc(
        "invite_organization_member",
        {
          p_organization_id: organizationId,
          p_therapist_id: existingProfile.id,
          p_role: formData.role,
          p_invited_by: currentUserId,
        }
      );

      if (inviteError) throw inviteError;

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${formData.email}`,
      });

      router.push("/dashboard/organization");
      router.refresh();
    } catch (error: any) {
      console.error("Error inviting member:", error);

      let errorMessage = "Failed to send invitation. Please try again.";
      if (error.message?.includes("already a member")) {
        errorMessage = "This user is already a member of your organization.";
      } else if (error.message?.includes("Only owners and admins")) {
        errorMessage = "You don't have permission to invite members.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Member Details</CardTitle>
            <CardDescription>
              Enter the email address of the person you want to invite
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="colleague@example.com"
              required
            />
            <p className="text-sm text-muted-foreground">
              The person must have an existing SessionSight account to receive
              the invitation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(
                value: "admin" | "supervisor" | "therapist" | "assistant"
              ) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  Admin - Can manage members and settings
                </SelectItem>
                <SelectItem value="supervisor">
                  Supervisor - Can oversee therapists and cases
                </SelectItem>
                <SelectItem value="therapist">
                  Therapist - Can manage assigned clients
                </SelectItem>
                <SelectItem value="assistant">
                  Assistant - Can view data and provide support
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Add a personal message to the invitation..."
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
