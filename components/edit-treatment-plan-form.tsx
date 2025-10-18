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
import { createBrowserClient } from "@/utils/supabase/client";

interface EditTreatmentPlanFormProps {
  clientId: string;
  plan: any;
}

export function EditTreatmentPlanForm({
  clientId,
  plan,
}: EditTreatmentPlanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: plan.title,
    description: plan.description || "",
    start_date: plan.start_date.split("T")[0],
    target_end_date: plan.target_end_date
      ? plan.target_end_date.split("T")[0]
      : "",
    status: plan.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createBrowserClient();

    const { error } = await supabase
      .from("treatment_plans")
      .update({
        title: formData.title,
        description: formData.description || null,
        start_date: formData.start_date,
        target_end_date: formData.target_end_date || null,
        status: formData.status,
      })
      .eq("id", plan.id);

    if (error) {
      console.error("Error updating treatment plan:", error);
      alert("Failed to update treatment plan");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/clients/${clientId}/treatment-plans/${plan.id}`);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Plan Details</CardTitle>
        <CardDescription>Update the treatment plan information</CardDescription>
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
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_end_date">Target End Date</Label>
              <Input
                id="target_end_date"
                type="date"
                value={formData.target_end_date}
                onChange={(e) =>
                  setFormData({ ...formData, target_end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/dashboard/clients/${clientId}/treatment-plans/${plan.id}`
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

