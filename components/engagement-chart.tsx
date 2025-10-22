"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Session {
  session_date: string;
  status: string;
}

interface EngagementChartProps {
  sessions: Session[];
}

export function EngagementChart({ sessions }: EngagementChartProps) {
  // Group sessions by week
  const weeklyData = sessions.reduce((acc, session) => {
    const date = new Date(session.session_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!acc[weekKey]) {
      acc[weekKey] = { week: weekKey, completed: 0, cancelled: 0, total: 0 };
    }

    acc[weekKey].total++;
    if (session.status === "completed") {
      acc[weekKey].completed++;
    } else if (session.status === "cancelled" || session.status === "no-show") {
      acc[weekKey].cancelled++;
    }

    return acc;
  }, {} as Record<string, { week: string; completed: number; cancelled: number; total: number }>);

  const chartData = Object.values(weeklyData)
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12) // Last 12 weeks
    .map((item) => ({
      week: new Date(item.week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      completed: item.completed,
      cancelled: item.cancelled,
    }));

  const recentData = chartData.slice(-4);
  const olderData = chartData.slice(-8, -4);
  const recentAvg =
    recentData.reduce((sum, d) => sum + d.completed, 0) / recentData.length;
  const olderAvg =
    olderData.reduce((sum, d) => sum + d.completed, 0) /
    (olderData.length || 1);
  const trend = recentAvg > olderAvg ? "up" : "down";
  const trendPercent =
    olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Session Trends</CardTitle>
          <div className="flex items-center gap-1 text-sm">
            {trend === "up" ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  +{trendPercent.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">
                  {trendPercent.toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Weekly session completion and cancellation rates
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                opacity={0.3}
              />
              <XAxis
                dataKey="week"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                stroke="hsl(var(--destructive))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                activeDot={{ r: 6 }}
                name="Cancelled"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No session data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
