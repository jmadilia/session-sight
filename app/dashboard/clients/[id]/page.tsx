"use client";

import type React from "react";

import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  Phone,
  User,
  Edit,
  TrendingUp,
  AlertTriangle,
  GripVertical,
  Settings,
  Eye,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SectionId =
  | "engagement"
  | "contact"
  | "statistics"
  | "notes"
  | "progress"
  | "appointments"
  | "history";

interface SectionConfig {
  id: SectionId;
  title: string;
  visible: boolean;
  column: "left" | "right";
}

function SortableSection({
  id,
  children,
  isCustomizing,
}: {
  id: string;
  children: React.ReactNode;
  isCustomizing: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isCustomizing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute right-2 top-2 cursor-grab active:cursor-grabbing z-10 p-1.5 bg-background border border-border rounded hover:bg-accent transition-colors shadow-sm">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      {children}
    </div>
  );
}

function DroppableColumn({
  id,
  sections,
  isCustomizing,
  renderSection,
}: {
  id: string;
  sections: SectionConfig[];
  isCustomizing: boolean;
  renderSection: (id: SectionId) => React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="space-y-4 min-h-[200px]">
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}>
        {sections.map((section) => (
          <SortableSection
            key={section.id}
            id={section.id}
            isCustomizing={isCustomizing}>
            {renderSection(section.id)}
          </SortableSection>
        ))}
      </SortableContext>
    </div>
  );
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const [sections, setSections] = useState<SectionConfig[]>([
    {
      id: "engagement",
      title: "Engagement Metrics",
      visible: true,
      column: "left",
    },
    {
      id: "contact",
      title: "Contact Information",
      visible: true,
      column: "left",
    },
    {
      id: "statistics",
      title: "Session Statistics",
      visible: true,
      column: "left",
    },
    { id: "notes", title: "Clinical Notes", visible: true, column: "left" },
    {
      id: "progress",
      title: "Progress Trends",
      visible: true,
      column: "right",
    },
    {
      id: "appointments",
      title: "Upcoming Appointments",
      visible: true,
      column: "right",
    },
    { id: "history", title: "Session History", visible: true, column: "right" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem(`client-sections-${clientId}`);
    if (saved) {
      try {
        setSections(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved sections", e);
      }
    }
  }, [clientId]);

  useEffect(() => {
    localStorage.setItem(
      `client-sections-${clientId}`,
      JSON.stringify(sections)
    );
  }, [sections, clientId]);

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

      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("therapist_id", user.id)
        .single();

      if (!clientData) {
        router.push("/dashboard/clients");
        return;
      }

      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("*")
        .eq("client_id", clientData.id)
        .order("session_date", { ascending: false });

      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", clientData.id)
        .gte("appointment_date", new Date().toISOString())
        .order("appointment_date", { ascending: true });

      const { data: metricsData } = await supabase
        .from("client_metrics")
        .select("*")
        .eq("client_id", clientData.id)
        .order("metric_date", { ascending: false })
        .limit(1)
        .single();

      setClient(clientData);
      setSessions(sessionsData || []);
      setAppointments(appointmentsData || []);
      setMetrics(metricsData);
      setLoading(false);
    }

    fetchData();
  }, [clientId, router]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeSection = sections.find((s) => s.id === active.id);
    const overSection = sections.find((s) => s.id === over.id);

    if (!activeSection) return;

    // If dropped on a column container
    if (over.id === "left" || over.id === "right") {
      setSections((prev) =>
        prev.map((s) =>
          s.id === active.id ? { ...s, column: over.id as "left" | "right" } : s
        )
      );
      return;
    }

    // If dropped on another section
    if (overSection && active.id !== over.id) {
      setSections((items) => {
        const activeIndex = items.findIndex((item) => item.id === active.id);
        const overIndex = items.findIndex((item) => item.id === over.id);

        const newItems = [...items];
        const [movedItem] = newItems.splice(activeIndex, 1);
        movedItem.column = overSection.column;
        newItems.splice(overIndex, 0, movedItem);

        return newItems;
      });
    }
  }

  function toggleSection(id: SectionId) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!client) {
    return <div className="p-8">Client not found</div>;
  }

  const completedSessions =
    sessions?.filter((s) => s.status === "completed") || [];
  const cancelledSessions =
    sessions?.filter(
      (s) => s.status === "cancelled" || s.status === "no-show"
    ) || [];
  const totalSessions = sessions?.length || 0;
  const attendanceRate =
    totalSessions > 0
      ? ((completedSessions.length / totalSessions) * 100).toFixed(0)
      : "0";

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

  const chartData = completedSessions
    .filter((s) => s.mood_rating || s.progress_rating)
    .reverse()
    .slice(-12)
    .map((s) => ({
      date: new Date(s.session_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      mood: s.mood_rating || 0,
      progress: s.progress_rating || 0,
    }));

  const isAtRisk =
    metrics?.risk_level === "high" || metrics?.risk_level === "medium";

  function renderSection(sectionId: SectionId) {
    switch (sectionId) {
      case "engagement":
        return (
          metrics && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Attendance Rate
                    </p>
                    <p className="text-xl font-bold">{attendanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cancellations
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.cancellation_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">No-Shows</p>
                    <p className="text-xl font-bold">
                      {metrics.no_show_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Engagement Score
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.engagement_score || "N/A"}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <Badge
                      variant={
                        metrics.risk_level === "high"
                          ? "destructive"
                          : metrics.risk_level === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-sm font-bold">
                      {metrics.risk_level || "low"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        );

      case "contact":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {client.email || "No email provided"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {client.phone || "No phone provided"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {client.date_of_birth
                    ? new Date(client.date_of_birth).toLocaleDateString()
                    : "DOB not provided"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  Started:{" "}
                  {client.initial_session_date
                    ? new Date(client.initial_session_date).toLocaleDateString()
                    : new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        );

      case "statistics":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Session Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Sessions
                  </p>
                  <p className="text-xl font-bold">{totalSessions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">
                    {completedSessions.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Mood</p>
                  <p className="text-xl font-bold">{avgMood}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                  <p className="text-xl font-bold">{avgProgress}</p>
                </div>
              </div>
              {cancelledSessions.length > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    {cancelledSessions.length} cancelled/no-show session(s)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "notes":
        return (
          client.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Clinical Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )
        );

      case "progress":
        return (
          chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress Trends</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Last 12 completed sessions
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full overflow-hidden">
                  <div className="flex gap-2">
                    <div className="flex flex-col justify-between h-[240px] py-2 text-xs text-muted-foreground">
                      <span>10</span>
                      <span>8</span>
                      <span>6</span>
                      <span>4</span>
                      <span>2</span>
                      <span>0</span>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                      <div className="min-w-[400px]">
                        <div className="flex items-end justify-between h-[240px] gap-1 pb-2 border-l border-b border-border">
                          {chartData.map((data, index) => (
                            <div
                              key={index}
                              className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                              <div
                                className="w-full bg-gradient-to-t from-teal-500 to-blue-500 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                style={{
                                  height: `${(data.mood / 10) * 100}%`,
                                  minHeight: data.mood > 0 ? "4px" : "0",
                                }}
                                title={`Mood: ${data.mood}/10`}
                              />
                              <div
                                className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                style={{
                                  height: `${(data.progress / 10) * 100}%`,
                                  minHeight: data.progress > 0 ? "4px" : "0",
                                }}
                                title={`Progress: ${data.progress}/10`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          {chartData.map((data, index) => (
                            <span
                              key={index}
                              className="text-[10px] text-muted-foreground flex-1 text-center">
                              {index % 2 === 0 ? data.date : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded" />
                      <span className="text-xs">Mood Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />
                      <span className="text-xs">Progress Rating</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        );

      case "appointments":
        return (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <Button asChild size="sm">
                <Link href={`/dashboard/appointments/new?client=${client.id}`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {appointments && appointments.length > 0 ? (
                <div className="space-y-2">
                  {appointments.slice(0, 5).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(appt.appointment_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                <p className="text-center text-muted-foreground text-sm py-4">
                  No upcoming appointments
                </p>
              )}
            </CardContent>
          </Card>
        );

      case "history":
        return (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Session History</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete timeline of all sessions
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/sessions/new?client=${client.id}`}>
                  <FileText className="w-4 h-4 mr-2" />
                  New Session
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <div key={session.id} className="relative">
                      {index < sessions.length - 1 && (
                        <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
                      )}
                      <div className="flex gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            session.status === "completed"
                              ? "bg-gradient-to-br from-teal-500 to-blue-500"
                              : session.status === "cancelled" ||
                                session.status === "no-show"
                              ? "bg-red-500"
                              : "bg-gray-300"
                          }`}>
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold">
                                  {new Date(
                                    session.session_date
                                  ).toLocaleDateString()}
                                </p>
                                <Badge
                                  variant={
                                    session.status === "completed"
                                      ? "default"
                                      : session.status === "cancelled" ||
                                        session.status === "no-show"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs">
                                  {session.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {session.duration_minutes} min •{" "}
                                {session.session_type}
                              </p>
                              {session.status === "completed" && (
                                <div className="flex items-center gap-3 text-xs">
                                  {session.mood_rating && (
                                    <span className="text-muted-foreground">
                                      Mood:{" "}
                                      <span className="font-medium text-foreground">
                                        {session.mood_rating}/10
                                      </span>
                                    </span>
                                  )}
                                  {session.progress_rating && (
                                    <span className="text-muted-foreground">
                                      Progress:{" "}
                                      <span className="font-medium text-foreground">
                                        {session.progress_rating}/10
                                      </span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/sessions/${session.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No sessions recorded yet
                </p>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  }

  const visibleSections = sections.filter((s) => s.visible);
  const leftSections = visibleSections.filter((s) => s.column === "left");
  const rightSections = visibleSections.filter((s) => s.column === "right");

  return (
    <div className="space-y-4">
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
        <div className="flex items-center gap-2">
          {isAtRisk && (
            <Badge variant="destructive" className="gap-1 text-white">
              <AlertTriangle className="w-3 h-3" />
              At Risk
            </Badge>
          )}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Sections
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {sections.map((section) => (
                <DropdownMenuCheckboxItem
                  key={section.id}
                  checked={section.visible}
                  onCheckedChange={() => toggleSection(section.id)}>
                  {section.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}>
            <Settings className="w-4 h-4 mr-2" />
            {isCustomizing ? "Done" : "Customize"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/clients/${client.id}/treatment-plans`}>
              <Target className="w-4 h-4 mr-2" />
              Treatment Plans
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/clients/${client.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DroppableColumn
            id="left"
            sections={leftSections}
            isCustomizing={isCustomizing}
            renderSection={renderSection}
          />
          <DroppableColumn
            id="right"
            sections={rightSections}
            isCustomizing={isCustomizing}
            renderSection={renderSection}
          />
        </div>
      </DndContext>
    </div>
  );
}
