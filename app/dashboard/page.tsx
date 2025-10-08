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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your practice.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently in treatment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancellation Rate
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationRate}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
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
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/clients/${client.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent">
                  <Link href="/dashboard/clients">View All Clients</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No clients yet</p>
                <Button asChild>
                  <Link href="/dashboard/clients/new">
                    Add Your First Client
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
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
                  className="w-full bg-transparent">
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
                <Button asChild>
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
