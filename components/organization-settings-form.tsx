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
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
}

interface OrganizationSettingsFormProps {
  organization: Organization;
}

export function OrganizationSettingsForm({
  organization,
}: OrganizationSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || "",
    logo_url: organization.logo_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("organizations")
        .update({
          name: formData.name,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
        })
        .eq("id", organization.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });

      router.push("/dashboard/organization");
      router.refresh();
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description:
          "Failed to update organization settings. Please try again.",
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
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Update your organization's basic information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Smith Therapy Associates"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your organization, its mission, or focus areas..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) =>
                setFormData({ ...formData, logo_url: e.target.value })
              }
              placeholder="https://example.com/logo.png"
              type="url"
            />
            <p className="text-sm text-muted-foreground">
              Provide a URL to your organization's logo image
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
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
