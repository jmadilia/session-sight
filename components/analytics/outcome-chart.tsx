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

interface Session {
  session_date: string;
  mood_rating: number | null;
  progress_rating: number | null;
  status: string;
}

interface OutcomeChartProps {
  sessions: Session[];
}

export function OutcomeChart({ sessions }: OutcomeChartProps) {
  // Group by month and calculate averages
  const monthlyData = sessions
    .filter(
      (s) => s.status === "completed" && s.mood_rating && s.progress_rating
    )
    .reduce((acc, session) => {
      const date = new Date(session.session_date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          moodSum: 0,
          progressSum: 0,
          count: 0,
        };
      }

      acc[monthKey].moodSum += session.mood_rating || 0;
      acc[monthKey].progressSum += session.progress_rating || 0;
      acc[monthKey].count++;

      return acc;
    }, {} as Record<string, { month: string; moodSum: number; progressSum: number; count: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      mood: Number((item.moodSum / item.count).toFixed(1)),
      progress: Number((item.progressSum / item.count).toFixed(1)),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Outcome Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis domain={[0, 10]} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#10b981"
                strokeWidth={2}
                name="Avg Mood"
              />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Avg Progress"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No outcome data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

