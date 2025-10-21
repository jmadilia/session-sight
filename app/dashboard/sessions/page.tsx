"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SessionsFilter } from "@/components/sessions-filter";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  session_date: string;
  status: string;
  duration_minutes: number;
  session_type: string;
  mood_rating: number | null;
  progress_rating: number | null;
  clients: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("sessions")
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
        .order("session_date", { ascending: false });

      if (data) {
        setSessions(data);
        setFilteredSessions(data);
      }
      setLoading(false);
    }

    fetchSessions();
  }, [router]);

  useEffect(() => {
    let filtered = sessions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((session) => {
        const clientName =
          `${session.clients?.first_name} ${session.clients?.last_name}`.toLowerCase();
        return clientName.includes(searchQuery.toLowerCase());
      });
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((session) =>
        statusFilter.includes(session.status)
      );
    }

    // Apply session type filter
    if (sessionTypeFilter.length > 0) {
      filtered = filtered.filter((session) =>
        sessionTypeFilter.includes(session.session_type)
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(
        (session) => new Date(session.session_date) >= startDate
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter(
        (session) => new Date(session.session_date) <= endDate
      );
    }

    setFilteredSessions(filtered);
  }, [searchQuery, statusFilter, sessionTypeFilter, dateRange, sessions]);

  const handleClearFilters = () => {
    setStatusFilter([]);
    setSessionTypeFilter([]);
    setDateRange({ start: "", end: "" });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Sessions
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage therapy session records
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/sessions/new">
            <Plus className="w-4 h-4 mr-2" />
            Record Session
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SessionsFilter
              statusFilter={statusFilter}
              sessionTypeFilter={sessionTypeFilter}
              dateRange={dateRange}
              onStatusFilterChange={setStatusFilter}
              onSessionTypeFilterChange={setSessionTypeFilter}
              onDateRangeChange={setDateRange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium truncate">
                          {session.clients?.first_name}{" "}
                          {session.clients?.last_name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              session.session_date
                            ).toLocaleDateString()}{" "}
                            •{" "}
                            {new Date(session.session_date).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : session.status === "cancelled"
                                ? "destructive"
                                : session.status === "no-show"
                                ? "destructive"
                                : "secondary"
                            }
                            className="w-fit">
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <span>{session.duration_minutes} min</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="capitalize">{session.session_type}</span>
                      {session.mood_rating && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>Mood: {session.mood_rating}/10</span>
                        </>
                      )}
                      {session.progress_rating && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>Progress: {session.progress_rating}/10</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto bg-transparent">
                      <Link href={`/dashboard/sessions/${session.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {sessions.length === 0
                  ? "No sessions recorded"
                  : "No sessions match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {sessions.length === 0
                  ? "Start tracking your therapy sessions"
                  : "Try adjusting your search or filters"}
              </p>
              {sessions.length === 0 && (
                <Button asChild>
                  <Link href="/dashboard/sessions/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Record Session
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
