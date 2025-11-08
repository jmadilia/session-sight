"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface InvitationCardProps {
  invitation: {
    id: string;
    role: string;
    created_at: string;
    organizations: {
      name: string;
      description: string | null;
      logo_url: string | null;
    };
  };
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);
    console.log("[v0] Accepting invitation:", invitation.id);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: invitation.id }),
      });

      console.log("[v0] Accept response status:", response.status);
      const data = await response.json();
      console.log("[v0] Accept response data:", data);

      if (response.ok) {
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[v0] Error accepting invitation:", error);
      alert("Failed to accept invitation");
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    console.log("[v0] Declining invitation:", invitation.id);

    try {
      const response = await fetch("/api/invitations/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: invitation.id }),
      });

      console.log("[v0] Decline response status:", response.status);
      const data = await response.json();
      console.log("[v0] Decline response data:", data);

      if (response.ok) {
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[v0] Error declining invitation:", error);
      alert("Failed to decline invitation");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>{invitation.organizations.name}</CardTitle>
            <CardDescription>
              {invitation.organizations.description || "Join this organization"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p className="text-muted-foreground">
            You've been invited to join as a{" "}
            <span className="font-semibold capitalize">{invitation.role}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Invited on {new Date(invitation.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600">
            Accept Invitation
          </Button>
          <Button
            onClick={handleDecline}
            disabled={isLoading}
            variant="outline">
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
