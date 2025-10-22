import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
      .eq("therapist_id", user.id)
      .eq("status", "active");

    if (clientsError) throw clientsError;

    // Calculate risk factors for each client
    const atRiskClients = clients
      ?.map((client) => {
        const sessions = client.sessions || [];
        const appointments = client.appointments || [];

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

        // Risk Factor 2: Declining mood/progress scores
        const completedSessions = sessions
          .filter(
            (s) =>
              s.status === "completed" && s.mood_rating && s.progress_rating
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
                (sum, s) =>
                  sum + (s.mood_rating || 0) + (s.progress_rating || 0),
                0
              ) /
              (recent.length * 2);
            const olderAvg =
              older.reduce(
                (sum, s) =>
                  sum + (s.mood_rating || 0) + (s.progress_rating || 0),
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

    return NextResponse.json({
      atRiskClients: atRiskClients || [],
      totalAtRisk: atRiskClients?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching at-risk clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch at-risk clients" },
      { status: 500 }
    );
  }
}
