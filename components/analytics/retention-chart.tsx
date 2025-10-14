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

interface Client {
  created_at: string;
  status: string;
}

interface Session {
  client_id: string;
  session_date: string;
}

interface RetentionChartProps {
  clients: Client[];
  sessions: Session[];
}

export function RetentionChart({ clients, sessions }: RetentionChartProps) {
  // Calculate retention by cohort (month joined)
  const cohortData = clients.reduce((acc, client) => {
    const joinDate = new Date(client.created_at);
    const cohortKey = `${joinDate.getFullYear()}-${String(
      joinDate.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[cohortKey]) {
      acc[cohortKey] = { cohort: cohortKey, total: 0, active: 0 };
    }

    acc[cohortKey].total++;
    if (client.status === "active") {
      acc[cohortKey].active++;
    }

    return acc;
  }, {} as Record<string, { cohort: string; total: number; active: number }>);

  const chartData = Object.values(cohortData)
    .sort((a, b) => a.cohort.localeCompare(b.cohort))
    .slice(-12)
    .map((item) => ({
      cohort: new Date(item.cohort + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      retention:
        item.total > 0
          ? Number(((item.active / item.total) * 100).toFixed(1))
          : 0,
      clients: item.total,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Retention by Cohort</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="cohort" className="text-xs" />
              <YAxis
                domain={[0, 100]}
                className="text-xs"
                label={{
                  value: "Retention %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "retention")
                    return [`${value}%`, "Retention Rate"];
                  return [value, name];
                }}
              />
              <Bar
                dataKey="retention"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No retention data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

