import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getAccessibleTherapistIds } from "@/utils/permissions";

export async function GET() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessibleTherapistIds = await getAccessibleTherapistIds(user.id);

  const [clientsResult, sessionsResult, appointmentsResult] = await Promise.all(
    [
      supabase
        .from("clients")
        .select("id, status, created_at")
        .in("therapist_id", accessibleTherapistIds),
      supabase
        .from("sessions")
        .select(
          "id, session_type, status, session_date, mood_rating, progress_rating"
        )
        .in("therapist_id", accessibleTherapistIds),
      supabase
        .from("appointments")
        .select("id, status, appointment_date")
        .in("therapist_id", accessibleTherapistIds),
    ]
  );

  if (clientsResult.error || sessionsResult.error || appointmentsResult.error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }

  const clients = clientsResult.data || [];
  const sessions = sessionsResult.data || [];
  const appointments = appointmentsResult.data || [];

  // Calculate analytics
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalSessions = sessions.filter((s) => s.status === "completed").length;
  const cancelledSessions = sessions.filter(
    (s) => s.status === "cancelled"
  ).length;
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "scheduled" && new Date(a.appointment_date) > new Date()
  ).length;

  // Calculate cancellation rate
  const cancellationRate =
    totalSessions + cancelledSessions > 0
      ? (cancelledSessions / (totalSessions + cancelledSessions)) * 100
      : 0;

  // Group sessions by type
  const sessionsByType = sessions.reduce(
    (acc: Record<string, number>, session) => {
      const type = session.session_type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {}
  );

  // Group clients by status
  const clientsByStatus = clients.reduce(
    (acc: Record<string, number>, client) => {
      const status = client.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  // Calculate engagement trends (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentSessions = sessions.filter(
    (s) => new Date(s.session_date) >= sixMonthsAgo
  );

  const engagementByMonth = recentSessions.reduce(
    (acc: Record<string, number>, session) => {
      const month = new Date(session.session_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {}
  );

  return NextResponse.json({
    summary: {
      totalClients,
      activeClients,
      totalSessions,
      upcomingAppointments,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
    },
    sessionsByType,
    clientsByStatus,
    engagementByMonth,
  });
}
