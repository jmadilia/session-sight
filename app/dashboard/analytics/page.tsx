import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { EngagementChart } from "@/components/engagement-chart";
import { SessionTypeChart } from "@/components/session-type-chart";
import { ClientStatusChart } from "@/components/client-status-chart";
import { TrendingUp, TrendingDown, Users, Calendar } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all sessions for analytics
  const { data: allSessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("therapist_id", user.id)
    .order("session_date", { ascending: true });

  // Fetch clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("therapist_id", user.id);

  // Calculate metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentSessions =
    allSessions?.filter((s) => new Date(s.session_date) >= thirtyDaysAgo) || [];
  const previousSessions =
    allSessions?.filter(
      (s) =>
        new Date(s.session_date) >= sixtyDaysAgo &&
        new Date(s.session_date) < thirtyDaysAgo
    ) || [];

  const completedRecent = recentSessions.filter(
    (s) => s.status === "completed"
  ).length;
  const completedPrevious = previousSessions.filter(
    (s) => s.status === "completed"
  ).length;
  const sessionGrowth =
    completedPrevious > 0
      ? ((completedRecent - completedPrevious) / completedPrevious) * 100
      : 0;

  const cancelledRecent = recentSessions.filter(
    (s) => s.status === "cancelled" || s.status === "no-show"
  ).length;
  const cancellationRate =
    recentSessions.length > 0
      ? (cancelledRecent / recentSessions.length) * 100
      : 0;

  const activeClients =
    clients?.filter((c) => c.status === "active").length || 0;
  const totalClients = clients?.length || 0;
  const retentionRate =
    totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

  // Calculate average mood and progress
  const completedWithRatings =
    allSessions?.filter((s) => s.status === "completed" && s.mood_rating) || [];
  const avgMood =
    completedWithRatings.length > 0
      ? completedWithRatings.reduce((sum, s) => sum + (s.mood_rating || 0), 0) /
        completedWithRatings.length
      : 0;
  const avgProgress =
    completedWithRatings.length > 0
      ? completedWithRatings.reduce(
          (sum, s) => sum + (s.progress_rating || 0),
          0
        ) / completedWithRatings.length
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Practice insights and client engagement trends
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessions (30d)
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRecent}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {sessionGrowth >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600">
                    +{sessionGrowth.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                  <span className="text-red-600">
                    {sessionGrowth.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancellation Rate
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cancellationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cancelledRecent} of {recentSessions.length} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Client Retention
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retentionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeClients} of {totalClients} clients active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Client Mood
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMood.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground mt-1">
              Progress: {avgProgress.toFixed(1)}/10
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EngagementChart sessions={allSessions || []} />
        <SessionTypeChart sessions={allSessions || []} />
      </div>

      <ClientStatusChart clients={clients || []} />
    </div>
  );
}
