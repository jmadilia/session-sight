"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AppointmentsFilter } from "@/components/appointments-filter";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type Appointment = {
  id: string;
  appointment_date: string;
  status: string;
  duration_minutes: number;
  notes: string | null;
  clients: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
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

      if (data) {
        setAppointments(data);
        setFilteredAppointments(data);
      }
      setLoading(false);
    }

    fetchAppointments();
  }, [router]);

  useEffect(() => {
    let filtered = appointments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((appt) => {
        const clientName =
          `${appt.clients?.first_name} ${appt.clients?.last_name}`.toLowerCase();
        return clientName.includes(searchQuery.toLowerCase());
      });
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((appt) => statusFilter.includes(appt.status));
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(
        (appt) => new Date(appt.appointment_date) >= startDate
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (appt) => new Date(appt.appointment_date) <= endDate
      );
    }

    setFilteredAppointments(filtered);
  }, [searchQuery, statusFilter, dateRange, appointments]);

  const handleClearFilters = () => {
    setStatusFilter([]);
    setDateRange({ start: "", end: "" });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const now = new Date();
  const upcoming = filteredAppointments.filter(
    (a) => new Date(a.appointment_date) >= now
  );
  const past = filteredAppointments.filter(
    (a) => new Date(a.appointment_date) < now
  );

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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <AppointmentsFilter
              statusFilter={statusFilter}
              dateRange={dateRange}
              onStatusFilterChange={setStatusFilter}
              onDateRangeChange={setDateRange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </CardHeader>
      </Card>

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
                  {filteredAppointments.length === 0 && appointments.length > 0
                    ? "No appointments match your filters"
                    : "No upcoming appointments"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {filteredAppointments.length === 0 && appointments.length > 0
                    ? "Try adjusting your search or filters"
                    : "Schedule your next session"}
                </p>
                {filteredAppointments.length === 0 &&
                appointments.length > 0 ? null : (
                  <Button asChild>
                    <Link href="/dashboard/appointments/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Past Appointments</h2>
          </CardHeader>
          <CardContent>
            {past.length > 0 ? (
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
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">
                  {filteredAppointments.length === 0 && appointments.length > 0
                    ? "No past appointments match your filters"
                    : "No past appointments"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filteredAppointments.length === 0 && appointments.length > 0
                    ? "Try adjusting your search or filters"
                    : "Past appointments will appear here"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
