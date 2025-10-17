"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface Session {
  duration_minutes: number;
  status: string;
}

interface SessionDurationChartProps {
  sessions: Session[];
}

export function SessionDurationChart({ sessions }: SessionDurationChartProps) {
  // Group sessions by duration ranges
  const completedSessions = sessions.filter(
    (s) => s.status === "completed" && s.duration_minutes
  );

  const durationRanges = {
    "0-30 min": 0,
    "30-45 min": 0,
    "45-60 min": 0,
    "60-90 min": 0,
    "90+ min": 0,
  };

  completedSessions.forEach((session) => {
    const duration = session.duration_minutes;
    if (duration <= 30) durationRanges["0-30 min"]++;
    else if (duration <= 45) durationRanges["30-45 min"]++;
    else if (duration <= 60) durationRanges["45-60 min"]++;
    else if (duration <= 90) durationRanges["60-90 min"]++;
    else durationRanges["90+ min"]++;
  });

  const chartData = Object.entries(durationRanges).map(([range, count]) => ({
    range,
    sessions: count,
  }));

  const avgDuration =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((sum, s) => sum + s.duration_minutes, 0) /
          completedSessions.length
        ).toFixed(0)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Duration Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average: {avgDuration} minutes
        </p>
      </CardHeader>
      <CardContent>
        {chartData.some((d) => d.sessions > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar
                dataKey="sessions"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Sessions"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No session duration data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

