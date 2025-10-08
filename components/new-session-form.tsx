"use client";

import type React from "react";
import { useState } from "react";
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
import { Slider } from "@/components/ui/slider";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

interface NewSessionFormProps {
  therapistId: string;
  clients: Client[];
  preselectedClientId?: string;
}

export function NewSessionForm({
  therapistId,
  clients,
  preselectedClientId,
}: NewSessionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [moodRating, setMoodRating] = useState<number>(5);
  const [progressRating, setProgressRating] = useState<number>(5);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const sessionData = {
      therapist_id: therapistId,
      client_id: formData.get("client_id") as string,
      session_date: new Date(
        formData.get("session_date") as string
      ).toISOString(),
      duration_minutes: Number.parseInt(
        formData.get("duration_minutes") as string
      ),
      session_type: formData.get("session_type") as string,
      status: formData.get("status") as string,
      mood_rating: formData.get("status") === "completed" ? moodRating : null,
      progress_rating:
        formData.get("status") === "completed" ? progressRating : null,
    };

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      toast({
        title: "Error",
        description: "Failed to record session. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // If there are notes, create session notes
    const notes = formData.get("notes") as string;
    if (notes && session) {
      const { error: notesError } = await supabase
        .from("session_notes")
        .insert({
          session_id: session.id,
          content: notes,
        });

      if (notesError) {
        console.error("Failed to save notes:", notesError);
      }
    }

    toast({
      title: "Success",
      description: "Session recorded successfully",
    });

    router.push("/dashboard/sessions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Select
              name="client_id"
              defaultValue={preselectedClientId}
              required>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session_date">Session Date & Time *</Label>
              <Input
                id="session_date"
                name="session_date"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                defaultValue="50"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session_type">Session Type *</Label>
              <Select name="session_type" defaultValue="individual" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="couples">Couples</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="completed" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No-Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client Mood Rating: {moodRating}/10</Label>
              <Slider
                value={[moodRating]}
                onValueChange={(value) => setMoodRating(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How did the client report feeling during the session?
              </p>
            </div>

            <div className="space-y-2">
              <Label>Progress Rating: {progressRating}/10</Label>
              <Slider
                value={[progressRating]}
                onValueChange={(value) => setProgressRating(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How much progress was made toward treatment goals?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Session summary, interventions used, client responses, homework assigned..."
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Document key points, interventions, and observations from the
              session
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Recording..." : "Record Session"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
