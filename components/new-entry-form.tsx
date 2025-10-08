"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export function NewEntryForm({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          mood_score: moodScore[0],
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create entry");
      }

      toast({
        title: "Entry created",
        description: "Your journal entry has been saved successfully.",
      });

      router.push("/dashboard/entries");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entry Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write about your day, thoughts, or feelings..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mood Score</Label>
              <span className="text-2xl font-bold">{moodScore[0]}/10</span>
            </div>
            <Slider
              value={moodScore}
              onValueChange={setMoodScore}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Neutral</span>
              <span>Very High</span>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      borderColor: tag.color || undefined,
                      backgroundColor: selectedTags.includes(tag.id)
                        ? tag.color || undefined
                        : undefined,
                    }}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Entry
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
