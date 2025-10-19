"use client";

import type React from "react";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      toast({
        title: "Error",
        description: "Failed to update treatment plan. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Treatment plan updated successfully",
    });

    router.push(`/dashboard/clients/${clientId}/treatment-plans/${plan.id}`);
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from("treatment_plans")
        .delete()
        .eq("id", plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Treatment plan deleted successfully",
      });

      router.push(`/dashboard/clients/${clientId}`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting treatment plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete treatment plan. Please try again.",
        variant: "destructive",
      });
      setDeleting(false);
    }
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
            <Button type="submit" disabled={loading || deleting}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/dashboard/clients/${clientId}/treatment-plans/${plan.id}`
                )
              }
              disabled={loading || deleting}>
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  disabled={loading || deleting}>
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Treatment Plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this treatment plan? This
                    action cannot be undone and will also delete all associated
                    goals.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-white hover:bg-destructive/90">
                    {deleting ? "Deleting..." : "Delete Plan"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

