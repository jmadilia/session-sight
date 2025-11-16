"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useUsageLimits } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useToast } from "@/hooks/use-toast";

interface NewClientFormProps {
  therapistId: string;
}

export function NewClientForm({ therapistId }: NewClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { clients, isLoading: limitsLoading } = useUsageLimits();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const isAtLimit =
    clients && !clients.isUnlimited && clients.current >= clients.limit;
  const isNearLimit =
    clients && !clients.isUnlimited && clients.current >= clients.limit * 0.8;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isAtLimit) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        date_of_birth: (formData.get("date_of_birth") as string) || null,
        initial_session_date:
          (formData.get("initial_session_date") as string) || null,
        status: (formData.get("status") as string) || "active",
        notes: (formData.get("notes") as string) || null,
      }),
    });

    const data = await response.json();

    if (response.status === 403 && data.upgradeRequired) {
      setShowUpgradePrompt(true);
      setIsLoading(false);
      return;
    }

    if (!response.ok) {
      toast({
        title: "Error",
        description: data.error || "Failed to add client. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Client added successfully",
    });

    router.push("/dashboard/clients");
    router.refresh();
  }

  return (
    <>
      {showUpgradePrompt && (
        <UpgradePrompt
          feature="Unlimited Clients"
          currentPlan={clients?.plan || "free"}
          suggestedPlan="pro"
          variant="modal"
        />
      )}

      {!limitsLoading && isNearLimit && !isAtLimit && (
        <Alert
          variant="default"
          className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Approaching Client Limit</AlertTitle>
          <AlertDescription>
            You've used {clients?.current} of {clients?.limit} clients on your{" "}
            {clients?.plan} plan. Consider upgrading for unlimited clients.
          </AlertDescription>
        </Alert>
      )}

      {!limitsLoading && isAtLimit && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Client Limit Reached</AlertTitle>
          <AlertDescription>
            You've reached your limit of {clients?.limit} clients. Upgrade to
            add more clients.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" name="first_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" name="last_name" required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input id="date_of_birth" name="date_of_birth" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial_session_date">
                  Initial Session Date
                </Label>
                <Input
                  id="initial_session_date"
                  name="initial_session_date"
                  type="date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Initial assessment, presenting issues, treatment goals..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || isAtLimit}>
                {isLoading
                  ? "Adding..."
                  : isAtLimit
                  ? "Limit Reached"
                  : "Add Client"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
