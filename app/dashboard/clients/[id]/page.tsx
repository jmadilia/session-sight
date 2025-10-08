import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, FileText, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .eq("therapist_id", user.id)
    .single();

  if (!client) {
    notFound();
  }

  // Fetch client's sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("client_id", client.id)
    .order("session_date", { ascending: false })
    .limit(10);

  // Fetch upcoming appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("client_id", client.id)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true });

  // Calculate stats
  const completedSessions =
    sessions?.filter((s) => s.status === "completed") || [];
  const cancelledSessions =
    sessions?.filter(
      (s) => s.status === "cancelled" || s.status === "no-show"
    ) || [];
  const avgMood =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((sum, s) => sum + (s.mood_rating || 0), 0) /
          completedSessions.filter((s) => s.mood_rating).length
        ).toFixed(1)
      : "N/A";
  const avgProgress =
    completedSessions.length > 0
      ? (
          completedSessions.reduce(
            (sum, s) => sum + (s.progress_rating || 0),
            0
          ) / completedSessions.filter((s) => s.progress_rating).length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/clients">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Client details and session history
          </p>
        </div>
        <Badge
          variant={
            client.status === "active"
              ? "default"
              : client.status === "inactive"
              ? "secondary"
              : "outline"
          }>
          {client.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {client.email || "No email provided"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {client.phone || "No phone provided"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {client.date_of_birth
                  ? new Date(client.date_of_birth).toLocaleDateString()
                  : "DOB not provided"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Started:{" "}
                {client.initial_session_date
                  ? new Date(client.initial_session_date).toLocaleDateString()
                  : new Date(client.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedSessions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
                <p className="text-2xl font-bold">{avgMood}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{avgProgress}</p>
              </div>
            </div>
            {cancelledSessions.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {cancelledSessions.length} cancelled/no-show session(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sessions</CardTitle>
            <Button asChild size="sm">
              <Link href={`/dashboard/sessions/new?client=${client.id}`}>
                <FileText className="w-4 h-4 mr-2" />
                New Session
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(session.session_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.duration_minutes} min • {session.session_type}
                      </p>
                    </div>
                    <Badge
                      variant={
                        session.status === "completed"
                          ? "default"
                          : session.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No sessions recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Appointments</CardTitle>
            <Button asChild size="sm">
              <Link href={`/dashboard/appointments/new?client=${client.id}`}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(appt.appointment_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appt.appointment_date).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <Badge
                      variant={
                        appt.status === "confirmed"
                          ? "default"
                          : appt.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }>
                      {appt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No upcoming appointments
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
