"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Users, Calendar } from "lucide-react";

interface AnalyticsInsightsProps {
  sessions: any[];
  clients: any[];
  cancellationRate: number;
  sessionGrowth: number;
  retentionRate: number;
}

export function AnalyticsInsights({
  sessions,
  clients,
  cancellationRate,
  sessionGrowth,
  retentionRate,
}: AnalyticsInsightsProps) {
  const insights = [];

  // High cancellation rate
  if (cancellationRate > 15) {
    insights.push({
      type: "warning",
      icon: AlertCircle,
      title: "High Cancellation Rate",
      description: `Your cancellation rate of ${cancellationRate.toFixed(
        1
      )}% is above the recommended 15%. Consider implementing reminder systems or reviewing scheduling policies.`,
    });
  }

  // Positive session growth
  if (sessionGrowth > 10) {
    insights.push({
      type: "success",
      icon: TrendingUp,
      title: "Strong Session Growth",
      description: `Sessions increased by ${sessionGrowth.toFixed(
        1
      )}% compared to the previous period. Your practice is growing!`,
    });
  }

  // Low retention
  if (retentionRate < 70) {
    insights.push({
      type: "warning",
      icon: Users,
      title: "Client Retention Opportunity",
      description: `Your retention rate of ${retentionRate.toFixed(
        1
      )}% could be improved. Consider reaching out to inactive clients or implementing follow-up protocols.`,
    });
  }

  // Low session volume
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  if (completedSessions < 10) {
    insights.push({
      type: "info",
      icon: Calendar,
      title: "Build Your Practice",
      description: `You've completed ${completedSessions} sessions in this period. Consider marketing efforts or accepting new clients to grow your practice.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      icon: TrendingUp,
      title: "Practice Performing Well",
      description:
        "Your key metrics are within healthy ranges. Keep up the great work!",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const colorClass =
            insight.type === "warning"
              ? "text-yellow-600"
              : insight.type === "success"
              ? "text-green-600"
              : "text-blue-600";

          return (
            <div key={index} className="flex gap-3">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colorClass}`} />
              <div>
                <h4 className="font-medium">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

