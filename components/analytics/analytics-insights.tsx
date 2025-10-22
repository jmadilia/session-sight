"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Lightbulb,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalyticsInsightsProps {
  sessions: any[];
  clients: any[];
  cancellationRate: number;
  sessionGrowth: number;
  retentionRate: number;
}

type Priority = "high" | "medium" | "low";

interface Insight {
  type: "warning" | "success" | "info";
  priority: Priority;
  icon: any;
  title: string;
  description: string;
  action: string;
}

export function AnalyticsInsights({
  sessions,
  clients,
  cancellationRate,
  sessionGrowth,
  retentionRate,
}: AnalyticsInsightsProps) {
  const insights: Insight[] = [];

  // High cancellation rate
  if (cancellationRate > 15) {
    insights.push({
      type: "warning",
      priority: "high",
      icon: AlertCircle,
      title: "High Cancellation Rate",
      description: `Your cancellation rate of ${cancellationRate.toFixed(
        1
      )}% is above the recommended 15%.`,
      action:
        "Consider implementing automated reminder systems 24-48 hours before appointments, or review your cancellation policy.",
    });
  }

  // Positive session growth
  if (sessionGrowth > 10) {
    insights.push({
      type: "success",
      priority: "medium",
      icon: TrendingUp,
      title: "Strong Session Growth",
      description: `Sessions increased by ${sessionGrowth.toFixed(
        1
      )}% compared to the previous period.`,
      action:
        "Your practice is growing! Consider expanding availability or bringing on additional support staff.",
    });
  }

  // Low retention
  if (retentionRate < 70) {
    insights.push({
      type: "warning",
      priority: "high",
      icon: Users,
      title: "Client Retention Opportunity",
      description: `Your retention rate of ${retentionRate.toFixed(
        1
      )}% could be improved.`,
      action:
        "Reach out to inactive clients with check-in messages, or implement a structured follow-up protocol after 2-3 weeks of inactivity.",
    });
  }

  // Low session volume
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  if (completedSessions < 10) {
    insights.push({
      type: "info",
      priority: "medium",
      icon: Calendar,
      title: "Build Your Practice",
      description: `You've completed ${completedSessions} sessions in this period.`,
      action:
        "Consider marketing efforts, networking with referral sources, or accepting new clients through online directories.",
    });
  }

  // Excellent retention
  if (retentionRate >= 85) {
    insights.push({
      type: "success",
      priority: "low",
      icon: Target,
      title: "Excellent Client Retention",
      description: `Your retention rate of ${retentionRate.toFixed(
        1
      )}% is outstanding!`,
      action:
        "Keep doing what you're doing. Consider documenting your client engagement strategies to maintain this success.",
    });
  }

  // Consistent growth
  if (sessionGrowth > 5 && sessionGrowth <= 10) {
    insights.push({
      type: "success",
      priority: "low",
      icon: Lightbulb,
      title: "Steady Practice Growth",
      description: `Your practice is growing at a healthy ${sessionGrowth.toFixed(
        1
      )}% rate.`,
      action:
        "This sustainable growth rate is ideal. Continue your current client acquisition strategies.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      priority: "low",
      icon: TrendingUp,
      title: "Practice Performing Well",
      description: "Your key metrics are within healthy ranges.",
      action:
        "Keep up the great work! Continue monitoring your metrics to maintain this performance.",
    });
  }

  const priorityOrder: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  insights.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Insights & Recommendations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Actionable insights based on your practice data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const colorClass =
            insight.type === "warning"
              ? "text-yellow-600 dark:text-yellow-500"
              : insight.type === "success"
              ? "text-green-600 dark:text-green-500"
              : "text-blue-600 dark:text-blue-500";

          const badgeVariant =
            insight.priority === "high"
              ? "destructive"
              : insight.priority === "medium"
              ? "default"
              : "secondary";

          return (
            <div
              key={index}
              className="flex gap-3 p-4 rounded-lg border bg-card/50 transition-colors hover:bg-card">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colorClass}`} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge variant={badgeVariant} className="text-xs">
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
                <div className="flex items-start gap-2 mt-2 p-2 rounded bg-muted/50">
                  <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  <p className="text-sm">{insight.action}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
