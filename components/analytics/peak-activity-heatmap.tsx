"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Session {
  session_date: string;
  status: string;
}

interface PeakActivityHeatmapProps {
  sessions: Session[];
}

export function PeakActivityHeatmap({ sessions }: PeakActivityHeatmapProps) {
  const completedSessions = sessions.filter((s) => s.status === "completed");

  // Initialize heatmap data structure
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const heatmapData: Record<string, Record<number, number>> = {};
  days.forEach((day) => {
    heatmapData[day] = {};
    hours.forEach((hour) => {
      heatmapData[day][hour] = 0;
    });
  });

  // Populate heatmap with session counts
  completedSessions.forEach((session) => {
    const date = new Date(session.session_date);
    const day = days[date.getDay()];
    const hour = date.getHours();

    if (hour >= 8 && hour < 20) {
      heatmapData[day][hour]++;
    }
  });

  // Find max value for color scaling
  const maxSessions = Math.max(
    ...Object.values(heatmapData).flatMap((dayData) => Object.values(dayData)),
    1
  );

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    const intensity = Math.min(count / maxSessions, 1);
    if (intensity < 0.25) return "bg-primary/20";
    if (intensity < 0.5) return "bg-primary/40";
    if (intensity < 0.75) return "bg-primary/60";
    return "bg-primary/80";
  };

  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    hour: number;
  } | null>(null);

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Peak Activity Times</CardTitle>
        <p className="text-sm text-muted-foreground">
          Session frequency by day and time - {completedSessions.length} total
          sessions
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Hour labels */}
          <div className="flex gap-1">
            <div className="w-12" />
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-muted-foreground">
                {hour % 12 || 12}
                {hour < 12 ? "a" : "p"}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map((day) => (
            <div key={day} className="flex gap-1 items-center">
              <div className="w-12 text-xs font-medium">{day}</div>
              {hours.map((hour) => {
                const count = heatmapData[day][hour];
                const isSelected =
                  selectedCell?.day === day && selectedCell?.hour === hour;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`flex-1 aspect-square rounded ${getColor(
                      count
                    )} flex items-center justify-center text-xs font-medium transition-all duration-200 hover:ring-2 hover:ring-primary hover:scale-110 cursor-pointer ${
                      isSelected ? "ring-2 ring-primary scale-110" : ""
                    }`}
                    title={`${day} ${hour}:00 - ${count} sessions`}
                    onClick={() => setSelectedCell({ day, hour })}>
                    {count > 0 ? count : ""}
                  </div>
                );
              })}
            </div>
          ))}

          {selectedCell && (
            <div className="mt-4 p-3 rounded-lg border bg-card/50">
              <p className="text-sm font-medium">
                {selectedCell.day} at {selectedCell.hour % 12 || 12}:00{" "}
                {selectedCell.hour < 12 ? "AM" : "PM"}
              </p>
              <p className="text-sm text-muted-foreground">
                {heatmapData[selectedCell.day][selectedCell.hour]} sessions
                completed
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted" />
              <div className="w-4 h-4 rounded bg-primary/20" />
              <div className="w-4 h-4 rounded bg-primary/40" />
              <div className="w-4 h-4 rounded bg-primary/60" />
              <div className="w-4 h-4 rounded bg-primary/80" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
