"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertTriangle,
  Target,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  generateClientBrief,
  type ClientBrief,
} from "@/app/actions/generate-client-brief";

interface ClientBriefProps {
  clientId: string;
  clientName: string;
}

export function ClientBriefComponent({
  clientId,
  clientName,
}: ClientBriefProps) {
  const [brief, setBrief] = useState<ClientBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateBrief() {
    setLoading(true);
    setError(null);

    const result = await generateClientBrief(clientId);

    if (result.success && result.brief) {
      setBrief(result.brief);
    } else {
      setError(result.error || "Failed to generate brief");
    }

    setLoading(false);
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Client Brief
          </CardTitle>
          <Button
            onClick={handleGenerateBrief}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Brief
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        {!brief && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500 opacity-50" />
            <p className="text-sm">
              Generate an AI-powered brief to get caught up on {clientName}'s
              history, current status, and session preparation recommendations.
            </p>
          </div>
        )}

        {brief && (
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{brief.summary}</p>
            </div>

            {/* Risk Assessment */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-sm font-semibold">Risk Assessment</h4>
                <Badge
                  variant={
                    brief.riskAssessment.level === "high"
                      ? "destructive"
                      : brief.riskAssessment.level === "medium"
                      ? "default"
                      : "secondary"
                  }>
                  {brief.riskAssessment.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {brief.riskAssessment.reasoning}
              </p>
            </div>

            {/* Recent Highlights */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Highlights
              </h4>
              <ul className="space-y-1">
                {brief.recentHighlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerning Patterns */}
            {brief.concerningPatterns.length > 0 && (
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <h4 className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Concerning Patterns
                </h4>
                <ul className="space-y-1">
                  {brief.concerningPatterns.map((pattern, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                      <span className="mt-1">⚠️</span>
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Current Goals */}
            {brief.currentGoals.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Current Goals
                </h4>
                <div className="space-y-2">
                  {brief.currentGoals.map((goal, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{goal.goal}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {goal.progress}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Preparation */}
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <h4 className="text-sm font-semibold mb-3">
                Session Preparation
              </h4>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Suggested Topics
                  </p>
                  <ul className="space-y-1">
                    {brief.sessionPreparation.suggestedTopics.map(
                      (topic, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start gap-2">
                          <span className="text-purple-500 mt-1">→</span>
                          <span>{topic}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Areas of Focus
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {brief.sessionPreparation.areasOfFocus.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

