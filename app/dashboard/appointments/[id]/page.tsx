import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { UpdateAppointmentForm } from "@/components/update-appointment-form";

export default async function AppointmentDetailPage(props: any) {
  const { params } = props as { params: { id: string } };
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      *,
      clients (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `
    )
    .eq("id", params.id)
    .eq("therapist_id", user.id)
    .single();

  if (!appointment) {
    notFound();
  }

  const isPast = new Date(appointment.appointment_date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/appointments">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Appointment Details
          </h1>
          <p className="text-muted-foreground mt-1">
            {appointment.clients?.first_name} {appointment.clients?.last_name}
          </p>
        </div>
        <Badge
          variant={
            appointment.status === "confirmed"
              ? "default"
              : appointment.status === "cancelled"
              ? "destructive"
              : "secondary"
          }>
          {appointment.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Client</p>
                <Link
                  href={`/dashboard/clients/${appointment.clients?.id}`}
                  className="text-sm text-primary hover:underline">
                  {appointment.clients?.first_name}{" "}
                  {appointment.clients?.last_name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.appointment_date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.duration_minutes} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Update Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {!isPast ? (
              <UpdateAppointmentForm appointment={appointment} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  This appointment has already passed
                </p>
                {appointment.status === "completed" ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    Session was completed
                  </p>
                ) : (
                  <Button asChild className="mt-4">
                    <Link
                      href={`/dashboard/sessions/new?client=${appointment.client_id}`}>
                      Record Session
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {appointment.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
