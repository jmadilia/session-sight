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
  session_type: string;
  status: string;
}

interface SessionTypeChartProps {
  sessions: Session[];
}

export function SessionTypeChart({ sessions }: SessionTypeChartProps) {
  const typeData = sessions.reduce((acc, session) => {
    const type = session.session_type;
    if (!acc[type]) {
      acc[type] = { type, count: 0 };
    }
    if (session.status === "completed") {
      acc[type].count++;
    }
    return acc;
  }, {} as Record<string, { type: string; count: number }>);

  const chartData = Object.values(typeData).map((item) => ({
    type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    sessions: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Types</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="type" className="text-xs" />
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
              />
            </BarChart>
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
