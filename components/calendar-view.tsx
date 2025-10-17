"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  GripVertical,
  Calendar,
  Clock,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Appointment = {
  id: string;
  appointment_date: string;
  status: string;
  duration_minutes: number;
  notes: string | null;
  clients: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

type Session = {
  session_type: string;
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  individual: "bg-blue-500",
  group: "bg-purple-500",
  family: "bg-green-500",
  couples: "bg-pink-500",
  initial: "bg-orange-500",
};

export function CalendarView() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    hour: number;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(
          `
          *,
          clients (
            id,
            first_name,
            last_name
          )
        `
        )
        .eq("therapist_id", user.id)
        .order("appointment_date", { ascending: true });

      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("session_type")
        .eq("therapist_id", user.id);

      if (appointmentsData) setAppointments(appointmentsData);
      if (sessionsData) setSessions(sessionsData);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const appointmentId = active.id as string;
    const overIdStr = over.id as string;
    const lastHyphenIndex = overIdStr.lastIndexOf("-");
    const dateStr = overIdStr.substring(0, lastHyphenIndex);
    const hourStr = overIdStr.substring(lastHyphenIndex + 1);

    const [year, month, day] = dateStr.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);
    newDate.setHours(Number.parseInt(hourStr), 0, 0, 0);

    const originalAppointment = appointments.find(
      (appt) => appt.id === appointmentId
    );
    if (!originalAppointment) {
      return;
    }

    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === appointmentId
          ? { ...appt, appointment_date: newDate.toISOString() }
          : appt
      )
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ appointment_date: newDate.toISOString() })
      .eq("id", appointmentId);

    if (error) {
      console.error("[v0] Error updating appointment:", error);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? originalAppointment : appt
        )
      );
    }
  };

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);
    while (days.length < 35) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days =
    view === "week" ? getWeekDays(currentDate) : getMonthDays(currentDate);
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const getAppointmentsForSlot = (date: Date, hour: number) => {
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.appointment_date);
      return (
        apptDate.getFullYear() === date.getFullYear() &&
        apptDate.getMonth() === date.getMonth() &&
        apptDate.getDate() === date.getDate() &&
        apptDate.getHours() === hour
      );
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getSessionTypeColor = (clientId: string) => {
    const clientSessions = sessions.filter((s) => s.session_type);
    if (clientSessions.length > 0) {
      const sessionType = clientSessions[0].session_type;
      return SESSION_TYPE_COLORS[sessionType] || "bg-gray-500";
    }
    return "bg-gray-500";
  };

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Calendar View
          </h1>
          <p className="text-muted-foreground mt-2">
            {view === "week" ? "Week of " : ""}
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === "week" ? "month" : "week")}>
            {view === "week" ? "Month" : "Week"} View
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/appointments">
              <List className="w-4 h-4 mr-2" />
              List View
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/appointments/new">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            onDragEnd={handleDragEnd}
            onDragStart={(e) => setActiveId(e.active.id as string)}>
            <div className="overflow-x-auto">
              {view === "week" ? (
                <WeekView
                  days={days}
                  hours={hours}
                  getAppointmentsForSlot={getAppointmentsForSlot}
                  getSessionTypeColor={getSessionTypeColor}
                  onSlotClick={(date, hour) => setSelectedSlot({ date, hour })}
                  onAppointmentClick={(appt) => setSelectedAppointment(appt)}
                />
              ) : (
                <MonthView
                  days={days}
                  currentDate={currentDate}
                  appointments={appointments}
                  getSessionTypeColor={getSessionTypeColor}
                  onDayClick={(date) => setSelectedSlot({ date, hour: 9 })}
                  onAppointmentClick={(appt) => setSelectedAppointment(appt)}
                />
              )}
            </div>
            <DragOverlay>
              {activeId ? (
                <div className="p-2 bg-primary text-primary-foreground rounded shadow-lg">
                  Dragging...
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Appointment</DialogTitle>
            <DialogDescription>
              {selectedSlot &&
                `${selectedSlot.date.toLocaleDateString()} at ${
                  selectedSlot.hour
                }:00`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => {
                const date = selectedSlot?.date;
                const hour = selectedSlot?.hour;
                if (date && hour !== undefined) {
                  const selectedDateTime = new Date(date);
                  selectedDateTime.setHours(hour, 0, 0, 0);
                  router.push(
                    `/dashboard/appointments/new?datetime=${selectedDateTime.toISOString()}`
                  );
                  setSelectedSlot(null);
                }
              }}>
              Schedule New Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.clients?.first_name}{" "}
                    {selectedAppointment.clients?.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.duration_minutes} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge
                  variant={
                    selectedAppointment.status === "scheduled"
                      ? "default"
                      : "secondary"
                  }>
                  {selectedAppointment.status}
                </Badge>
              </div>
              {selectedAppointment.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <Link
                    href={`/dashboard/appointments/${selectedAppointment.id}`}>
                    Edit Appointment
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WeekView({
  days,
  hours,
  getAppointmentsForSlot,
  getSessionTypeColor,
  onSlotClick,
  onAppointmentClick,
}: {
  days: Date[];
  hours: number[];
  getAppointmentsForSlot: (date: Date, hour: number) => any[];
  getSessionTypeColor: (clientId: string) => string;
  onSlotClick: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: any) => void;
}) {
  return (
    <div className="min-w-[800px]">
      <div className="grid grid-cols-8 gap-px bg-border">
        <div className="bg-background p-2 font-semibold text-sm">Time</div>
        {days.map((day, i) => (
          <div key={i} className="bg-background p-2 text-center">
            <div className="font-semibold text-sm">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div className="text-xs text-muted-foreground">{day.getDate()}</div>
          </div>
        ))}
      </div>
      {hours.map((hour) => (
        <div key={hour} className="grid grid-cols-8 gap-px bg-border">
          <div className="bg-background p-2 text-sm text-muted-foreground">
            {hour % 12 || 12}:00 {hour < 12 ? "AM" : "PM"}
          </div>
          {days.map((day, i) => (
            <TimeSlot
              key={`${day.toISOString()}-${hour}`}
              date={day}
              hour={hour}
              appointments={getAppointmentsForSlot(day, hour)}
              getSessionTypeColor={getSessionTypeColor}
              onClick={() => onSlotClick(day, hour)}
              onAppointmentClick={onAppointmentClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MonthView({
  days,
  currentDate,
  appointments,
  getSessionTypeColor,
  onDayClick,
  onAppointmentClick,
}: {
  days: Date[];
  currentDate: Date;
  appointments: any[];
  getSessionTypeColor: (clientId: string) => string;
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: any) => void;
}) {
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.appointment_date);
      return (
        apptDate.getFullYear() === date.getFullYear() &&
        apptDate.getMonth() === date.getMonth() &&
        apptDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-px bg-border mb-px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-background p-2 text-center font-semibold text-sm">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {days.map((day, i) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          return (
            <div
              key={i}
              className={`bg-background p-2 min-h-[100px] ${
                !isCurrentMonth ? "opacity-40" : ""
              }`}>
              <div className="text-sm font-semibold mb-1">{day.getDate()}</div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className={`text-xs p-1 rounded ${getSessionTypeColor(
                      appt.clients?.id || ""
                    )} text-white truncate cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(appt);
                    }}>
                    {new Date(appt.appointment_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {appt.clients?.first_name}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
              <div
                className="flex-1 min-h-[20px]"
                onClick={() => onDayClick(day)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlot({
  date,
  hour,
  appointments,
  getSessionTypeColor,
  onClick,
  onAppointmentClick,
}: {
  date: Date;
  hour: number;
  appointments: any[];
  getSessionTypeColor: (clientId: string) => string;
  onClick: () => void;
  onAppointmentClick: (appointment: any) => void;
}) {
  const slotId = `${date.toISOString().split("T")[0]}-${hour}`;
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  return (
    <div
      ref={setNodeRef}
      className={`bg-background p-1 min-h-[60px] transition-all cursor-pointer ${
        isOver
          ? "bg-primary/20 border-2 border-primary border-dashed ring-2 ring-primary/50"
          : "hover:bg-accent border-2 border-transparent"
      }`}
      onClick={onClick}>
      {appointments.map((appt) => (
        <DraggableAppointment
          key={appt.id}
          appointment={appt}
          getSessionTypeColor={getSessionTypeColor}
          onAppointmentClick={onAppointmentClick}
        />
      ))}
      {isOver && (
        <div className="text-xs text-primary font-semibold mt-1">Drop here</div>
      )}
    </div>
  );
}

function DraggableAppointment({
  appointment,
  getSessionTypeColor,
  onAppointmentClick,
}: {
  appointment: any;
  getSessionTypeColor: (clientId: string) => string;
  onAppointmentClick: (appointment: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: appointment.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`text-xs p-1 mb-1 rounded ${getSessionTypeColor(
        appointment.clients?.id || ""
      )} text-white flex items-center gap-1 group`}>
      <div
        {...listeners}
        {...attributes}
        className="cursor-move hover:bg-white/20 rounded p-0.5 flex-shrink-0">
        <GripVertical className="w-3 h-3" />
      </div>
      <div
        className="flex-1 truncate cursor-pointer hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          onAppointmentClick(appointment);
        }}>
        {appointment.clients?.first_name} {appointment.clients?.last_name}
        <Badge variant="secondary" className="ml-1 text-[10px] h-4">
          {appointment.status}
        </Badge>
      </div>
    </div>
  );
}

