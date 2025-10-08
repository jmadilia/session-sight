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
} from "recharts";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
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
