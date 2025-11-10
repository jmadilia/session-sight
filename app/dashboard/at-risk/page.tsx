import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessibleTherapistIds } from "@/utils/permissions";

export default async function AtRiskClientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const accessibleTherapistIds = await getAccessibleTherapistIds(user.id);

  // Get all active clients with their recent sessions and appointments
  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select(
      `
      id,
      first_name,
      last_name,
      status,
      initial_session_date,
      sessions (
        id,
        session_date,
        status,
        mood_rating,
        progress_rating
      ),
      appointments (
        id,
        appointment_date,
        status
      )
    `
    )
    .in("therapist_id", accessibleTherapistIds)
    .eq("status", "active");

  // Calculate risk factors for each client
  const atRiskClients = clients
    ?.map((client) => {
      const sessions = client.sessions || [];
      const appointments = client.appointments || [];

      console.log(
        `[v0] Client ${client.first_name} ${client.last_name}: ${sessions.length} sessions`
      );

      // Calculate risk factors
      const recentSessions = sessions
        .filter((s) => {
          const sessionDate = new Date(s.session_date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return sessionDate >= thirtyDaysAgo;
        })
        .sort(
          (a, b) =>
            new Date(b.session_date).getTime() -
            new Date(a.session_date).getTime()
        );

      const recentCancellations = recentSessions.filter(
        (s) => s.status === "cancelled"
      ).length;
      const recentNoShows = recentSessions.filter(
        (s) => s.status === "no-show"
      ).length;

      console.log(
        `[v0] ${client.first_name}: ${recentCancellations} cancellations, ${recentNoShows} no-shows in last 30 days`
      );

      // Risk Factor 2: Declining mood/progress scores
      const completedSessions = sessions
        .filter(
          (s) => s.status === "completed" && s.mood_rating && s.progress_rating
        )
        .sort(
          (a, b) =>
            new Date(b.session_date).getTime() -
            new Date(a.session_date).getTime()
        );

      let decliningTrend = false;
      if (completedSessions.length >= 3) {
        const recent = completedSessions.slice(0, 2);
        const older = completedSessions.slice(2, 4);
        if (older.length > 0) {
          const recentAvg =
            recent.reduce(
              (sum, s) => sum + (s.mood_rating || 0) + (s.progress_rating || 0),
              0
            ) /
            (recent.length * 2);
          const olderAvg =
            older.reduce(
              (sum, s) => sum + (s.mood_rating || 0) + (s.progress_rating || 0),
              0
            ) /
            (older.length * 2);
          decliningTrend = recentAvg < olderAvg - 1;
        }
      }

      // Risk Factor 3: Gap in sessions (no session in last 21 days)
      const lastSession = sessions
        .filter((s) => s.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.session_date).getTime() -
            new Date(a.session_date).getTime()
        )[0];

      let daysSinceLastSession = 0;
      let sessionGap = false;

      if (lastSession) {
        daysSinceLastSession = Math.floor(
          (Date.now() - new Date(lastSession.session_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        sessionGap = daysSinceLastSession > 21;
      }

      const lowScores =
        completedSessions.length > 0 &&
        completedSessions.slice(0, 2).some((s) => {
          return (s.mood_rating || 0) < 5 || (s.progress_rating || 0) < 5;
        });

      // Calculate overall risk score (0-100)
      let riskScore = 0;
      const riskFactors: string[] = [];

      if (recentCancellations >= 2) {
        riskScore += 30;
        riskFactors.push(
          `${recentCancellations} cancellations in last 30 days`
        );
      }

      if (recentNoShows >= 1) {
        riskScore += 30;
        riskFactors.push(`${recentNoShows} no-show(s) in last 30 days`);
      }

      if (decliningTrend) {
        riskScore += 25;
        riskFactors.push("Declining mood/progress scores");
      }

      if (sessionGap && lastSession) {
        riskScore += 30;
        riskFactors.push(`No session in ${daysSinceLastSession} days`);
      }

      if (lowScores) {
        riskScore += 15;
        riskFactors.push("Recent low mood/progress scores");
      }

      console.log(
        `[v0] ${client.first_name}: Risk score ${riskScore}, factors: ${riskFactors.length}`
      );

      // Determine risk level
      let riskLevel: "high" | "medium" | "low" = "low";
      if (riskScore >= 50) riskLevel = "high";
      else if (riskScore >= 25) riskLevel = "medium";

      return {
        id: client.id,
        name: `${client.first_name} ${client.last_name}`,
        riskScore,
        riskLevel,
        riskFactors,
        lastSessionDate: lastSession?.session_date || null,
        recentSessionCount: recentSessions.length,
        cancellationRate:
          recentSessions.length > 0
            ? Math.round((recentCancellations / recentSessions.length) * 100)
            : 0,
      };
    })
    .filter((client) => client.riskLevel !== "low")
    .sort((a, b) => b.riskScore - a.riskScore);

  const atRiskData = {
    atRiskClients: atRiskClients || [],
    totalAtRisk: atRiskClients?.length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight text-red-700 dark:text-red-400">
            At-Risk Clients
          </h1>
        </div>
        <p className="text-muted-foreground">
          Clients showing patterns that may indicate disengagement or risk of
          dropping out
        </p>
      </div>

      {atRiskData.totalAtRisk === 0 ? (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  No At-Risk Clients
                </h3>
                <p className="text-muted-foreground">
                  All your active clients are showing healthy engagement
                  patterns
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {atRiskData.atRiskClients.map((client: any) => (
            <Card
              key={client.id}
              className={`${
                client.riskLevel === "high"
                  ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"
                  : "border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10"
              }`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        client.riskLevel === "high"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-orange-100 dark:bg-orange-900/30"
                      }`}>
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          client.riskLevel === "high"
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            client.riskLevel === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          }`}>
                          {client.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Risk Score: {client.riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 w-full sm:w-auto">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      View Client Details
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">
                      Risk Factors:
                    </h4>
                    <ul className="space-y-2">
                      {client.riskFactors.map((factor: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm">
                          <span
                            className={`mt-0.5 ${
                              client.riskLevel === "high"
                                ? "text-red-500"
                                : "text-orange-500"
                            }`}>
                            •
                          </span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Session
                      </p>
                      <p className="font-medium text-sm">
                        {client.lastSessionDate
                          ? new Date(
                              client.lastSessionDate
                            ).toLocaleDateString()
                          : "No sessions"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Recent Sessions
                      </p>
                      <p className="font-medium text-sm">
                        {client.recentSessionCount} (30 days)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Cancellation Rate
                      </p>
                      <p className="font-medium text-sm">
                        {client.cancellationRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
