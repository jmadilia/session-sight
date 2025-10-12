import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "active");

  const { count: totalSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id);

  const { count: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .gte("appointment_date", new Date().toISOString())
    .in("status", ["scheduled", "confirmed"]);

  // Calculate cancellation rate
  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("status")
    .eq("therapist_id", user.id)
    .gte(
      "session_date",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    );

  const cancellationRate =
    recentSessions && recentSessions.length > 0
      ? (
          (recentSessions.filter(
            (s) => s.status === "cancelled" || s.status === "no-show"
          ).length /
            recentSessions.length) *
          100
        ).toFixed(1)
      : "0";

  // Fetch recent clients
  const { data: recentClients } = await supabase
    .from("clients")
    .select("*")
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch upcoming appointments
  const { data: upcomingAppts } = await supabase
    .from("appointments")
    .select(
      `
      *,
      clients (
        first_name,
        last_name
      )
    `
    )
    .eq("therapist_id", user.id)
    .gte("appointment_date", new Date().toISOString())
    .in("status", ["scheduled", "confirmed"])
    .order("appointment_date", { ascending: true })
    .limit(5);

  const { data: clientsWithData } = await supabase
    .from("clients")
    .select(
      `
      id,
      first_name,
      last_name,
      status,
      sessions (
        id,
        session_date,
        status,
        mood_rating,
        progress_rating
      ),
      appointments (
        id,
        appointment_date,
        status
      )
    `
    )
    .eq("therapist_id", user.id)
    .eq("status", "active");

  console.log(
    "[v0] Fetched clients for at-risk analysis:",
    clientsWithData?.length
  );

  // Calculate risk factors for each client
  const atRiskClients =
    clientsWithData
      ?.map((client) => {
        const sessions = client.sessions || [];
        const appointments = client.appointments || [];

        console.log(
          `[v0] Analyzing client ${client.first_name} ${client.last_name}:`,
          {
            sessionsCount: sessions.length,
            appointmentsCount: appointments.length,
          }
        );

        // Calculate risk factors
        const recentSessions = sessions
          .filter((s) => {
            const sessionDate = new Date(s.session_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return sessionDate >= thirtyDaysAgo;
          })
          .sort(
            (a, b) =>
              new Date(b.session_date).getTime() -
              new Date(a.session_date).getTime()
          );

        // Risk Factor 1: Recent cancellations or no-shows in SESSIONS (not appointments)
        const recentCancellations = recentSessions.filter(
          (s) => s.status === "cancelled"
        ).length;
        const recentNoShows = recentSessions.filter(
          (s) => s.status === "no-show"
        ).length;

        console.log(`[v0] ${client.first_name} cancellations/no-shows:`, {
          recentCancellations,
          recentNoShows,
        });

        // Risk Factor 2: Declining mood/progress scores
        const completedSessions = sessions
          .filter(
            (s) =>
              s.status === "completed" && s.mood_rating && s.progress_rating
          )
          .sort(
            (a, b) =>
              new Date(b.session_date).getTime() -
              new Date(a.session_date).getTime()
          );

        let decliningTrend = false;
        if (completedSessions.length >= 3) {
          const recent = completedSessions.slice(0, 2);
          const older = completedSessions.slice(2, 4);
          if (older.length > 0) {
            const recentAvg =
              recent.reduce(
                (sum, s) =>
                  sum + (s.mood_rating || 0) + (s.progress_rating || 0),
                0
              ) /
              (recent.length * 2);
            const olderAvg =
              older.reduce(
                (sum, s) =>
                  sum + (s.mood_rating || 0) + (s.progress_rating || 0),
                0
              ) /
              (older.length * 2);
            decliningTrend = recentAvg < olderAvg - 1;
          }
        }

        // Risk Factor 3: Gap in sessions (no session in last 21 days)
        const lastSession = sessions
          .filter((s) => s.status === "completed")
          .sort(
            (a, b) =>
              new Date(b.session_date).getTime() -
              new Date(a.session_date).getTime()
          )[0];

        let daysSinceLastSession = 0;
        let sessionGap = false;

        if (lastSession) {
          daysSinceLastSession = Math.floor(
            (Date.now() - new Date(lastSession.session_date).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          sessionGap = daysSinceLastSession > 21;
        }

        // Risk Factor 4: Low recent mood/progress scores (changed threshold to < 5)
        const lowScores =
          completedSessions.length > 0 &&
          completedSessions.slice(0, 2).some((s) => {
            return (s.mood_rating || 0) < 5 || (s.progress_rating || 0) < 5;
          });

        console.log(`[v0] ${client.first_name} risk factors:`, {
          recentCancellations,
          recentNoShows,
          decliningTrend,
          sessionGap,
          daysSinceLastSession,
          lowScores,
        });

        // Calculate overall risk score (0-100)
        let riskScore = 0;
        const riskFactors: string[] = [];

        // Match SQL query logic: 2+ cancellations OR no-shows
        if (recentCancellations >= 2) {
          riskScore += 30;
          riskFactors.push(
            `${recentCancellations} cancellations in last 30 days`
          );
        }

        if (recentNoShows >= 1) {
          riskScore += 30;
          riskFactors.push(`${recentNoShows} no-show(s) in last 30 days`);
        }

        if (decliningTrend) {
          riskScore += 25;
          riskFactors.push("Declining mood/progress scores");
        }

        if (sessionGap && lastSession) {
          riskScore += 30;
          riskFactors.push(`No session in ${daysSinceLastSession} days`);
        }

        if (lowScores) {
          riskScore += 15;
          riskFactors.push("Recent low mood/progress scores");
        }

        console.log(`[v0] Risk analysis for ${client.first_name}:`, {
          riskScore,
          riskFactors,
        });

        // Determine risk level
        let riskLevel: "high" | "medium" | "low" = "low";
        if (riskScore >= 50) riskLevel = "high";
        else if (riskScore >= 25) riskLevel = "medium";

        return {
          id: client.id,
          name: `${client.first_name} ${client.last_name}`,
          riskScore,
          riskLevel,
          riskFactors,
          lastSessionDate: lastSession?.session_date || null,
          recentSessionCount: recentSessions.length,
          cancellationCount: recentCancellations,
          noShowCount: recentNoShows,
        };
      })
      .filter((client) => client.riskLevel !== "low")
      .sort((a, b) => b.riskScore - a.riskScore) || [];

  console.log("[v0] At-risk clients found:", atRiskClients.length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your practice.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
              {totalClients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in treatment
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {totalSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
              {upcomingAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {atRiskClients.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-700 dark:text-red-400">
                  At-Risk Clients ({atRiskClients.length})
                </CardTitle>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/30 bg-transparent">
                <Link href="/dashboard/at-risk">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {atRiskClients.slice(0, 4).map((client) => (
                <div
                  key={client.id}
                  className="flex flex-col p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-red-100 dark:border-red-900">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-base">{client.name}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        client.riskLevel === "high"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      }`}>
                      {client.riskLevel} risk
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5 mb-4 flex-1">
                    {client.riskFactors.slice(0, 3).map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant="outline"
                    size="default"
                    className="w-full hover:bg-red-100 dark:hover:bg-red-950/30 bg-transparent">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      View Client
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-teal-100 dark:border-teal-900">
          <CardHeader>
            <CardTitle className="text-teal-700 dark:text-teal-400">
              Recent Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentClients && recentClients.length > 0 ? (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {client.first_name} {client.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Started:{" "}
                        {new Date(
                          client.initial_session_date || client.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-teal-200 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-950/20 bg-transparent">
                      <Link href={`/dashboard/clients/${client.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent border-teal-200 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-950/20">
                  <Link href="/dashboard/clients">View All Clients</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No clients yet</p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                  <Link href="/dashboard/clients/new">
                    Add Your First Client
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppts && upcomingAppts.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {appt.clients?.first_name} {appt.clients?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appt.appointment_date).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        appt.status === "confirmed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20">
                  <Link href="/dashboard/appointments">
                    View All Appointments
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No upcoming appointments
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                  <Link href="/dashboard/appointments/new">
                    Schedule Appointment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
