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

interface NewProgressUpdateFormProps {
  clientId: string;
  planId: string;
  goalId: string;
}

export function NewProgressUpdateForm({
  clientId,
  planId,
  goalId,
}: NewProgressUpdateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    update_date: new Date().toISOString().split("T")[0],
    progress_note: "",
    progress_rating: "3",
    progress_percentage: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createBrowserClient();

    // Insert progress update
    const { error: updateError } = await supabase
      .from("progress_updates")
      .insert({
        goal_id: goalId,
        update_date: formData.update_date,
        progress_note: formData.progress_note,
        progress_rating: Number.parseInt(formData.progress_rating),
      });

    if (updateError) {
      console.error("Error creating progress update:", updateError);
      alert("Failed to create progress update");
      setLoading(false);
      return;
    }

    // Update goal progress percentage if provided
    if (formData.progress_percentage) {
      const { error: goalError } = await supabase
        .from("goals")
        .update({
          progress_percentage: Number.parseInt(formData.progress_percentage),
        })
        .eq("id", goalId);

      if (goalError) {
        console.error("Error updating goal progress:", goalError);
      }
    }

    router.push(`/dashboard/clients/${clientId}/treatment-plans/${planId}`);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Update</CardTitle>
        <CardDescription>Record progress for this goal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update_date">Date *</Label>
            <Input
              id="update_date"
              type="date"
              value={formData.update_date}
              onChange={(e) =>
                setFormData({ ...formData, update_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress_note">Progress Note *</Label>
            <Textarea
              id="progress_note"
              value={formData.progress_note}
              onChange={(e) =>
                setFormData({ ...formData, progress_note: e.target.value })
              }
              placeholder="Describe the progress made..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="progress_rating">Progress Rating (1-5) *</Label>
              <Select
                value={formData.progress_rating}
                onValueChange={(value) =>
                  setFormData({ ...formData, progress_rating: value })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - No Progress</SelectItem>
                  <SelectItem value="2">2 - Minimal Progress</SelectItem>
                  <SelectItem value="3">3 - Some Progress</SelectItem>
                  <SelectItem value="4">4 - Good Progress</SelectItem>
                  <SelectItem value="5">5 - Excellent Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress_percentage">
                Update Goal Progress %
              </Label>
              <Input
                id="progress_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    progress_percentage: e.target.value,
                  })
                }
                placeholder="0-100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Progress Update"}
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

