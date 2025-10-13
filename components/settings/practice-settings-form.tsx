"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Therapist {
  practice_name: string | null;
  license_number: string | null;
  specialization: string[] | null;
  default_session_duration: number | null;
  session_types: string[] | null;
}

interface PracticeSettingsFormProps {
  therapist: Therapist | null;
  userId: string;
}

export function PracticeSettingsForm({
  therapist,
  userId,
}: PracticeSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    practice_name: string;
    license_number: string;
    specialization: string[];
    default_session_duration: number;
    session_types: string[];
  }>({
    practice_name: therapist?.practice_name || "",
    license_number: therapist?.license_number || "",
    specialization: therapist?.specialization || [],
    default_session_duration: therapist?.default_session_duration || 50,
    session_types: therapist?.session_types || [
      "individual",
      "couples",
      "family",
      "group",
    ],
  });

  const [newSpecialization, setNewSpecialization] = useState("");
  const [newSessionType, setNewSessionType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("therapists")
        .update({
          practice_name: formData.practice_name,
          license_number: formData.license_number,
          specialization: formData.specialization,
          default_session_duration: formData.default_session_duration,
          session_types: formData.session_types,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Practice settings updated",
        description: "Your practice settings have been updated successfully.",
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating practice settings:", error);
      toast({
        title: "Error",
        description: "Failed to update practice settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSpecialization = () => {
    if (
      newSpecialization &&
      !formData.specialization.includes(newSpecialization)
    ) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, newSpecialization],
      });
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter((s) => s !== spec),
    });
  };

  const addSessionType = () => {
    if (newSessionType && !formData.session_types.includes(newSessionType)) {
      setFormData({
        ...formData,
        session_types: [...formData.session_types, newSessionType],
      });
      setNewSessionType("");
    }
  };

  const removeSessionType = (type: string) => {
    setFormData({
      ...formData,
      session_types: formData.session_types.filter((t) => t !== type),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="practice_name">Practice Name</Label>
        <Input
          id="practice_name"
          value={formData.practice_name}
          onChange={(e) =>
            setFormData({ ...formData, practice_name: e.target.value })
          }
          placeholder="Smith Therapy Associates"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="license_number">License Number</Label>
        <Input
          id="license_number"
          value={formData.license_number}
          onChange={(e) =>
            setFormData({ ...formData, license_number: e.target.value })
          }
          placeholder="LMFT-12345"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="default_session_duration">
          Default Session Duration (minutes)
        </Label>
        <Input
          id="default_session_duration"
          type="number"
          min="15"
          max="180"
          step="5"
          value={formData.default_session_duration}
          onChange={(e) =>
            setFormData({
              ...formData,
              default_session_duration: Number.parseInt(e.target.value),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Specializations</Label>
        <div className="flex gap-2">
          <Input
            value={newSpecialization}
            onChange={(e) => setNewSpecialization(e.target.value)}
            placeholder="Add specialization"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSpecialization();
              }
            }}
          />
          <Button
            type="button"
            onClick={addSpecialization}
            size="icon"
            variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.specialization.map((spec) => (
            <Badge key={spec} variant="secondary" className="gap-1">
              {spec}
              <button
                type="button"
                onClick={() => removeSpecialization(spec)}
                className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Session Types</Label>
        <div className="flex gap-2">
          <Input
            value={newSessionType}
            onChange={(e) => setNewSessionType(e.target.value)}
            placeholder="Add session type"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSessionType();
              }
            }}
          />
          <Button
            type="button"
            onClick={addSessionType}
            size="icon"
            variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.session_types.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <button
                type="button"
                onClick={() => removeSessionType(type)}
                className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

