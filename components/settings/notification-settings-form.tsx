"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface NotificationSettingsFormProps {
  therapist: any;
  userId: string;
}

export function NotificationSettingsForm({
  therapist,
  userId,
}: NotificationSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultPrefs = {
    email_reminders: true,
    appointment_confirmations: true,
    cancellation_alerts: true,
    at_risk_alerts: true,
  };

  const [preferences, setPreferences] = useState(
    therapist?.notification_preferences || defaultPrefs
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("therapists")
        .update({
          notification_preferences: preferences,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Notification preferences updated",
        description:
          "Your notification preferences have been updated successfully.",
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description:
          "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_reminders">Email Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive email reminders for upcoming appointments
            </p>
          </div>
          <Switch
            id="email_reminders"
            checked={preferences.email_reminders}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, email_reminders: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="appointment_confirmations">
              Appointment Confirmations
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified when clients confirm appointments
            </p>
          </div>
          <Switch
            id="appointment_confirmations"
            checked={preferences.appointment_confirmations}
            onCheckedChange={(checked) =>
              setPreferences({
                ...preferences,
                appointment_confirmations: checked,
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="cancellation_alerts">Cancellation Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts when appointments are cancelled
            </p>
          </div>
          <Switch
            id="cancellation_alerts"
            checked={preferences.cancellation_alerts}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, cancellation_alerts: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="at_risk_alerts">At-Risk Client Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when clients are flagged as at-risk
            </p>
          </div>
          <Switch
            id="at_risk_alerts"
            checked={preferences.at_risk_alerts}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, at_risk_alerts: checked })
            }
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

