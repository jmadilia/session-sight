import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default async function AppointmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: appointments } = await supabase
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
    .order("appointment_date", { ascending: true });

  const now = new Date();
  const upcoming =
    appointments?.filter((a) => new Date(a.appointment_date) >= now) || [];
  const past =
    appointments?.filter((a) => new Date(a.appointment_date) < now) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage upcoming sessions
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/appointments/new">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          </CardHeader>
          <CardContent>
            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">
                            {appt.clients?.first_name} {appt.clients?.last_name}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                appt.appointment_date
                              ).toLocaleDateString()}{" "}
                              •{" "}
                              {new Date(
                                appt.appointment_date
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <Badge
                              variant={
                                appt.status === "confirmed"
                                  ? "default"
                                  : appt.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="w-fit">
                              {appt.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 ml-8">
                        {appt.duration_minutes} minutes
                      </p>
                      {appt.notes && (
                        <p className="text-sm text-muted-foreground mt-1 ml-8 line-clamp-2">
                          {appt.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto bg-transparent">
                        <Link href={`/dashboard/appointments/${appt.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground mb-4">
                  Schedule your next session
                </p>
                <Button asChild>
                  <Link href="/dashboard/appointments/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {past.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Past Appointments</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {past.slice(0, 10).map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg opacity-60">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {appt.clients?.first_name} {appt.clients?.last_name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {new Date(appt.appointment_date).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="w-fit">
                          {appt.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
