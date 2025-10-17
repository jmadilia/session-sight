"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface Client {
  created_at: string;
}

interface ClientAcquisitionChartProps {
  clients: Client[];
}

export function ClientAcquisitionChart({
  clients,
}: ClientAcquisitionChartProps) {
  // Group clients by month
  const monthlyData = clients.reduce((acc, client) => {
    const date = new Date(client.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, count: 0 };
    }

    acc[monthKey].count++;

    return acc;
  }, {} as Record<string, { month: string; count: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      clients: item.count,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Acquisition</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="clients"
                stroke="hsl(var(--primary))"
                fill="url(#clientGradient)"
                strokeWidth={2}
                name="New Clients"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No client data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

