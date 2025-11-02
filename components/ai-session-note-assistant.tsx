"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { generateSessionNote } from "@/app/actions/generate-session-note";
import { useToast } from "@/hooks/use-toast";

interface AISessionNoteAssistantProps {
  clientId: string;
  sessionType: string;
  moodRating: number;
  progressRating: number;
  onNoteGenerated: (
    note: string,
    interventions: string[],
    goalsAddressed: string[],
    homework: string
  ) => void;
}

export function AISessionNoteAssistant({
  clientId,
  sessionType,
  moodRating,
  progressRating,
  onNoteGenerated,
}: AISessionNoteAssistantProps) {
  const [bulletPoints, setBulletPoints] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  async function handleGenerate() {
    if (!bulletPoints.trim()) {
      toast({
        title: "Input Required",
        description:
          "Please enter some bullet points or key observations from the session.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateSessionNote({
        clientId,
        sessionType,
        moodRating,
        progressRating,
        bulletPoints,
      });

      if (result.success && result.note) {
        onNoteGenerated(
          result.note.content,
          result.note.interventions,
          result.note.goalsAddressed,
          result.note.homeworkAssigned
        );
        toast({
          title: "Note Generated",
          description:
            "AI has generated a comprehensive session note. Review and edit as needed.",
        });
        setBulletPoints("");
      } else {
        toast({
          title: "Generation Failed",
          description:
            result.error ||
            "Failed to generate session note. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Session Note Assistant</CardTitle>
        </div>
        <CardDescription>
          Enter key points from the session and let AI generate a comprehensive
          clinical note
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bullet-points">Session Highlights & Key Points</Label>
          <Textarea
            id="bullet-points"
            value={bulletPoints}
            onChange={(e) => setBulletPoints(e.target.value)}
            placeholder="Enter bullet points or brief notes:&#10;- Client discussed work-related stress&#10;- Practiced deep breathing exercises&#10;- Client reported improved sleep&#10;- Assigned thought record homework"
            rows={6}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Provide brief bullet points or observations. AI will expand these
            into a professional clinical note.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !bulletPoints.trim()}
          className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Note...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Clinical Note
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          The AI will consider the client's history, recent sessions, and active
          treatment goals to generate a contextually relevant note.
        </p>
      </CardContent>
    </Card>
  );
}

