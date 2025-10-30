"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const clientBriefSchema = z.object({
  summary: z
    .string()
    .describe(
      "A concise 2-3 sentence summary of the client's current status and treatment journey"
    ),
  recentHighlights: z
    .array(z.string())
    .describe("3-5 key highlights from recent sessions"),
  concerningPatterns: z
    .array(z.string())
    .describe(
      "Any concerning patterns or red flags identified (empty array if none)"
    ),
  currentGoals: z
    .array(
      z.object({
        goal: z.string(),
        progress: z.string(),
      })
    )
    .describe("Current treatment goals and their progress status"),
  sessionPreparation: z.object({
    suggestedTopics: z
      .array(z.string())
      .describe("3-5 suggested talking points for the next session"),
    areasOfFocus: z.array(z.string()).describe("Key areas that need attention"),
  }),
  riskAssessment: z
    .object({
      level: z.enum(["low", "medium", "high"]),
      reasoning: z.string(),
    })
    .describe("Current risk level and reasoning"),
});

export type ClientBrief = z.infer<typeof clientBriefSchema>;

export async function generateClientBrief(
  clientId: string
): Promise<{ success: boolean; brief?: ClientBrief; error?: string }> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("therapist_id", user.id)
      .single();

    if (clientError || !client) {
      return { success: false, error: "Client not found" };
    }

    // Fetch recent sessions (last 10)
    const { data: sessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("client_id", clientId)
      .order("session_date", { ascending: false })
      .limit(10);

    // Fetch session notes for recent sessions
    const sessionIds = sessions?.map((s) => s.id) || [];
    const { data: notes } = await supabase
      .from("session_notes")
      .select("*")
      .in("session_id", sessionIds);

    // Fetch active treatment plans and goals
    const { data: treatmentPlans } = await supabase
      .from("treatment_plans")
      .select("*, goals(*)")
      .eq("client_id", clientId)
      .eq("status", "active");

    // Fetch recent metrics
    const { data: metrics } = await supabase
      .from("client_metrics")
      .select("*")
      .eq("client_id", clientId)
      .order("metric_date", { ascending: false })
      .limit(5);

    // Build context for AI
    const context = buildContext(
      client,
      sessions,
      notes,
      treatmentPlans,
      metrics
    );

    console.log("[v0] Generating client brief with AI...");

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: clientBriefSchema,
      prompt: `You are an experienced therapist assistant. Analyze the following client data and generate a comprehensive brief to help the therapist prepare for their next session.

${context}

Provide actionable insights, identify patterns, and suggest areas of focus. Be professional, empathetic, and clinically relevant.`,
    });

    console.log("[v0] Client brief generated successfully");

    return { success: true, brief: object };
  } catch (error) {
    console.error("[v0] Error generating client brief:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate brief",
    };
  }
}

function buildContext(
  client: any,
  sessions: any[] | null,
  notes: any[] | null,
  treatmentPlans: any[] | null,
  metrics: any[] | null
): string {
  let context = `CLIENT INFORMATION:
Name: ${client.first_name} ${client.last_name}
Status: ${client.status}
Initial Session Date: ${client.initial_session_date}
Clinical Notes: ${client.notes || "None"}

`;

  // Add session history
  if (sessions && sessions.length > 0) {
    context += `RECENT SESSIONS (${sessions.length} sessions):\n`;
    sessions.forEach((session, idx) => {
      context += `${idx + 1}. ${new Date(
        session.session_date
      ).toLocaleDateString()} - ${session.session_type}
   Status: ${session.status}
   Duration: ${session.duration_minutes} minutes
   Mood Rating: ${session.mood_rating || "N/A"}/10
   Progress Rating: ${session.progress_rating || "N/A"}/10
`;
    });
    context += "\n";
  }

  // Add session notes
  if (notes && notes.length > 0) {
    context += `SESSION NOTES:\n`;
    notes.forEach((note, idx) => {
      context += `${idx + 1}. ${note.content}
   Interventions: ${note.interventions?.join(", ") || "None"}
   Homework: ${note.homework_assigned || "None"}
`;
    });
    context += "\n";
  }

  // Add treatment plans and goals
  if (treatmentPlans && treatmentPlans.length > 0) {
    context += `ACTIVE TREATMENT PLANS:\n`;
    treatmentPlans.forEach((plan, idx) => {
      context += `${idx + 1}. ${plan.title}
   Description: ${plan.description}
   Goals:\n`;
      plan.goals?.forEach((goal: any, gIdx: number) => {
        context += `   ${gIdx + 1}. ${goal.title} (${goal.status}, ${
          goal.progress_percentage
        }% complete)
      ${goal.description}
`;
      });
    });
    context += "\n";
  }

  // Add metrics
  if (metrics && metrics.length > 0) {
    const latestMetric = metrics[0];
    context += `ENGAGEMENT METRICS:
Attendance Rate: ${latestMetric.attendance_rate}%
Engagement Score: ${latestMetric.engagement_score}/10
Risk Level: ${latestMetric.risk_level}
Recent Cancellations: ${latestMetric.cancellation_count}
Recent No-Shows: ${latestMetric.no_show_count}
`;
  }

  return context;
}

