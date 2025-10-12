import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default async function SessionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: sessions } = await supabase
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search sessions..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">
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
                No sessions recorded
              </h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your therapy sessions
              </p>
              <Button asChild>
                <Link href="/dashboard/sessions/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Session
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
