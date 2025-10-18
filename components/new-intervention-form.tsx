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
import { createBrowserClient } from "@/utils/supabase/client";

interface NewInterventionFormProps {
  clientId: string;
  planId: string;
  goalId: string;
}

export function NewInterventionForm({
  clientId,
  planId,
  goalId,
}: NewInterventionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createBrowserClient();

    const { error } = await supabase.from("interventions").insert({
      goal_id: goalId,
      title: formData.title,
      description: formData.description || null,
      frequency: formData.frequency || null,
    });

    if (error) {
      console.error("Error creating intervention:", error);
      alert("Failed to create intervention");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/clients/${clientId}/treatment-plans/${planId}`);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervention Details</CardTitle>
        <CardDescription>
          Add a new intervention strategy for this goal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Cognitive Behavioral Therapy"
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
              placeholder="Describe the intervention approach..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Input
              id="frequency"
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value })
              }
              placeholder="e.g., Weekly, Daily, As needed"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Intervention"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/dashboard/clients/${clientId}/treatment-plans/${planId}`
                )
              }>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

