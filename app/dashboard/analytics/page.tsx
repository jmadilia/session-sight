"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EngagementChart } from "@/components/engagement-chart";
import { SessionTypeChart } from "@/components/session-type-chart";
import { ClientStatusChart } from "@/components/client-status-chart";
import { OutcomeChart } from "@/components/analytics/outcome-chart";
import { RetentionChart } from "@/components/analytics/retention-chart";
import { ClientAcquisitionChart } from "@/components/analytics/client-acquisition-chart";
import { AppointmentUtilizationChart } from "@/components/analytics/appointment-utilization-chart";
import { SessionDurationChart } from "@/components/analytics/session-duration-chart";
import { PeakActivityHeatmap } from "@/components/analytics/peak-activity-heatmap";
import { AnalyticsInsights } from "@/components/analytics/analytics-insights";
import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  FileText,
  UserPlus,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DateRange = "7d" | "30d" | "90d" | "custom";

export default function AnalyticsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function checkPermissions() {
      const response = await fetch("/api/check-permissions");
      const data = await response.json();

      if (data.role === "assistant") {
        toast({
          title: "Access Restricted",
          description:
            "Assistants do not have permission to view analytics and reports.",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
        return;
      }

      setHasAccess(true);
    }

    checkPermissions();
  }, [router, toast]);

  useEffect(() => {
    if (!hasAccess) return;
    fetchData();
  }, [hasAccess]);

  async function fetchData() {
    const [sessionsResponse, clientsResponse, appointmentsResponse] =
      await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/clients"),
        fetch("/api/appointments"),
      ]);

    const [sessionsData, clientsData, appointmentsData] = await Promise.all([
      sessionsResponse.json(),
      clientsResponse.json(),
      appointmentsResponse.json(),
    ]);

    setSessions(sessionsData.sessions || []);
    setClients(clientsData.clients || []);
    setAppointments(appointmentsData.appointments || []);
    setLoading(false);
  }

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    if (dateRange === "custom" && customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const filteredSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.session_date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  const filteredAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.appointment_date);
    return appointmentDate >= startDate && appointmentDate <= endDate;
  });

  const filteredClients = clients.filter((c) => {
    const createdDate = new Date(c.created_at);
    return createdDate >= startDate && createdDate <= endDate;
  });

  const periodLength = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - periodLength);
  const previousEndDate = startDate;

  const previousSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.session_date);
    return sessionDate >= previousStartDate && sessionDate < previousEndDate;
  });

  const previousClients = clients.filter((c) => {
    const createdDate = new Date(c.created_at);
    return createdDate >= previousStartDate && createdDate < previousEndDate;
  });

  const completedCurrent = filteredSessions.filter(
    (s) => s.status === "completed"
  ).length;
  const completedPrevious = previousSessions.filter(
    (s) => s.status === "completed"
  ).length;
  const sessionGrowth =
    completedPrevious > 0
      ? ((completedCurrent - completedPrevious) / completedPrevious) * 100
      : 0;

  const cancelledCurrent = filteredSessions.filter(
    (s) => s.status === "cancelled" || s.status === "no-show"
  ).length;
  const cancellationRate =
    filteredSessions.length > 0
      ? (cancelledCurrent / filteredSessions.length) * 100
      : 0;

  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalClients = clients.length;
  const retentionRate =
    totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

  const completedWithRatings =
    filteredSessions.filter((s) => s.status === "completed" && s.mood_rating) ||
    [];
  const avgMood =
    completedWithRatings.length > 0
      ? completedWithRatings.reduce((sum, s) => sum + (s.mood_rating || 0), 0) /
        completedWithRatings.length
      : 0;
  const avgProgress =
    completedWithRatings.length > 0
      ? completedWithRatings.reduce(
          (sum, s) => sum + (s.progress_rating || 0),
          0
        ) / completedWithRatings.length
      : 0;

  const newClientsCount = filteredClients.length;
  const newClientsGrowth =
    previousClients.length > 0
      ? ((newClientsCount - previousClients.length) / previousClients.length) *
        100
      : 0;

  const completedSessionsWithDuration = filteredSessions.filter(
    (s) => s.status === "completed" && s.duration_minutes
  );
  const avgSessionDuration =
    completedSessionsWithDuration.length > 0
      ? completedSessionsWithDuration.reduce(
          (sum, s) => sum + s.duration_minutes,
          0
        ) / completedSessionsWithDuration.length
      : 0;

  const exportToCSV = () => {
    const csvData = filteredSessions.map((s) => ({
      Date: s.session_date,
      Type: s.session_type,
      Status: s.status,
      Duration: s.duration_minutes,
      Mood: s.mood_rating || "N/A",
      Progress: s.progress_rating || "N/A",
    }));

    const headers = Object.keys(csvData[0] || {}).join(",");
    const rows = csvData.map((row) => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();

    toast({
      title: "Export successful",
      description: "Analytics data exported to CSV",
    });
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("SessionSight Analytics Report", 20, 20);

      doc.setFontSize(10);
      doc.text(
        `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        20,
        30
      );

      doc.setFontSize(14);
      doc.text("Key Metrics", 20, 45);

      doc.setFontSize(10);
      let yPos = 55;
      doc.text(
        `Completed Sessions: ${completedCurrent} (${
          sessionGrowth >= 0 ? "+" : ""
        }${sessionGrowth.toFixed(1)}%)`,
        20,
        yPos
      );
      yPos += 8;
      doc.text(`Cancellation Rate: ${cancellationRate.toFixed(1)}%`, 20, yPos);
      yPos += 8;
      doc.text(`Client Retention: ${retentionRate.toFixed(1)}%`, 20, yPos);
      yPos += 8;
      doc.text(
        `Average Client Outcomes: ${avgMood.toFixed(
          1
        )}/10 (Progress: ${avgProgress.toFixed(1)}/10)`,
        20,
        yPos
      );
      yPos += 8;
      doc.text(
        `New Clients: ${newClientsCount} (${
          newClientsGrowth >= 0 ? "+" : ""
        }${newClientsGrowth.toFixed(1)}%)`,
        20,
        yPos
      );
      yPos += 8;
      doc.text(
        `Average Session Duration: ${avgSessionDuration.toFixed(0)} minutes`,
        20,
        yPos
      );

      yPos += 15;
      doc.setFontSize(14);
      doc.text("Session Breakdown", 20, yPos);

      yPos += 10;
      doc.setFontSize(10);
      const sessionTypes = filteredSessions.reduce((acc, s) => {
        if (s.status === "completed") {
          acc[s.session_type] = (acc[s.session_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      Object.entries(sessionTypes).forEach(([type, count]) => {
        doc.text(
          `${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`,
          20,
          yPos
        );
        yPos += 6;
      });

      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 280);

      doc.save(
        `sessionsight-analytics-${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast({
        title: "Export successful",
        description: "Analytics report exported to PDF",
      });
    } catch (error) {
      console.error("[v0] PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Unable to generate PDF report",
        variant: "destructive",
      });
    }
  };

  if (!hasAccess || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Practice insights and client engagement trends
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomStartDateChange={setCustomStartDate}
            onCustomEndDateChange={setCustomEndDate}
          />
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCurrent}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {sessionGrowth >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{sessionGrowth.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {sessionGrowth.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newClientsCount}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {newClientsGrowth >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{newClientsGrowth.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {newClientsGrowth.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Session Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgSessionDuration.toFixed(0)} min
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedSessionsWithDuration.length} completed sessions
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Client Retention
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retentionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeClients} of {totalClients} clients active
            </p>
          </CardContent>
        </Card>
      </div>

      <AnalyticsInsights
        sessions={filteredSessions}
        clients={clients}
        cancellationRate={cancellationRate}
        sessionGrowth={sessionGrowth}
        retentionRate={retentionRate}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <EngagementChart sessions={sessions} />
        <ClientAcquisitionChart clients={clients} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SessionTypeChart sessions={filteredSessions} />
        <AppointmentUtilizationChart appointments={appointments} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <OutcomeChart sessions={sessions} />
        <SessionDurationChart sessions={filteredSessions} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RetentionChart clients={clients} sessions={sessions} />
        <PeakActivityHeatmap sessions={sessions} />
      </div>

      <ClientStatusChart clients={clients} />
    </div>
  );
}
