import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export default async function SessionDetailPage(props: any) {
  const { params } = props as { params: { id: string } };
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: session } = await supabase
    .from("sessions")
    .select(
      `
      *,
      clients (
        id,
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("id", params.id)
    .eq("therapist_id", user.id)
    .single();

  if (!session) {
    notFound();
  }

  const { data: notes } = await supabase
    .from("session_notes")
    .select("*")
    .eq("session_id", session.id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/sessions">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
          <p className="text-muted-foreground mt-1">
            {session.clients?.first_name} {session.clients?.last_name} •{" "}
            {new Date(session.session_date).toLocaleDateString()}
          </p>
        </div>
        <Badge
          variant={
            session.status === "completed"
              ? "default"
              : session.status === "cancelled"
              ? "destructive"
              : session.status === "no-show"
              ? "destructive"
              : "secondary"
          }>
          {session.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Client</p>
                <Link
                  href={`/dashboard/clients/${session.clients?.id}`}
                  className="text-sm text-primary hover:underline">
                  {session.clients?.first_name} {session.clients?.last_name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(session.session_date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {session.duration_minutes} minutes
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Session Type</p>
              <Badge variant="outline" className="capitalize">
                {session.session_type}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            {session.status === "completed" ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Client Mood
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {session.mood_rating || "N/A"}
                    </span>
                    {session.mood_rating && (
                      <span className="text-muted-foreground">/10</span>
                    )}
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    {session.mood_rating && (
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(session.mood_rating / 10) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Progress Rating
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {session.progress_rating || "N/A"}
                    </span>
                    {session.progress_rating && (
                      <span className="text-muted-foreground">/10</span>
                    )}
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    {session.progress_rating && (
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(session.progress_rating / 10) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Ratings not available for {session.status} sessions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {notes && (
        <Card>
          <CardHeader>
            <CardTitle>Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{notes.content}</p>
            </div>
            {notes.interventions && notes.interventions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Interventions Used</p>
                <div className="flex flex-wrap gap-2">
                  {notes.interventions.map(
                    (intervention: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {intervention}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
            {notes.goals_addressed && notes.goals_addressed.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Goals Addressed</p>
                <div className="flex flex-wrap gap-2">
                  {notes.goals_addressed.map((goal: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {notes.homework_assigned && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Homework Assigned</p>
                <p className="text-sm text-muted-foreground">
                  {notes.homework_assigned}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
