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
  Legend,
} from "recharts";

interface Appointment {
  appointment_date: string;
  status: string;
}

interface AppointmentUtilizationChartProps {
  appointments: Appointment[];
}

export function AppointmentUtilizationChart({
  appointments,
}: AppointmentUtilizationChartProps) {
  // Group appointments by week and status
  const weeklyData = appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.appointment_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!acc[weekKey]) {
      acc[weekKey] = {
        week: weekKey,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
      };
    }

    if (
      appointment.status === "scheduled" ||
      appointment.status === "confirmed"
    ) {
      acc[weekKey].scheduled++;
    } else if (appointment.status === "completed") {
      acc[weekKey].completed++;
    } else if (appointment.status === "cancelled") {
      acc[weekKey].cancelled++;
    }

    return acc;
  }, {} as Record<string, { week: string; scheduled: number; completed: number; cancelled: number }>);

  const chartData = Object.values(weeklyData)
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12)
    .map((item) => ({
      week: new Date(item.week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      scheduled: item.scheduled,
      completed: item.completed,
      cancelled: item.cancelled,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
              <Legend />
              <Bar
                dataKey="completed"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Completed"
                stackId="a"
              />
              <Bar
                dataKey="scheduled"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Scheduled"
                stackId="a"
              />
              <Bar
                dataKey="cancelled"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Cancelled"
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No appointment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

