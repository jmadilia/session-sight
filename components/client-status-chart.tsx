"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface Client {
  status: string;
}

interface ClientStatusChartProps {
  clients: Client[];
}

const COLORS = {
  active: "hsl(var(--primary))",
  inactive: "hsl(var(--muted))",
  discharged: "hsl(var(--destructive))",
};

export function ClientStatusChart({ clients }: ClientStatusChartProps) {
  const statusData = clients.reduce((acc, client) => {
    const status = client.status;
    if (!acc[status]) {
      acc[status] = { status, count: 0 };
    }
    acc[status].count++;
    return acc;
  }, {} as Record<string, { status: string; count: number }>);

  const chartData = Object.values(statusData).map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    status: item.status,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.status as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No client data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
