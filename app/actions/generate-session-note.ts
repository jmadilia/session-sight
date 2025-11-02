"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const sessionNoteSchema = z.object({
  content: z
    .string()
    .describe(
      "Comprehensive clinical session note following professional standards"
    ),
  interventions: z
    .array(z.string())
    .describe("List of therapeutic interventions used during the session"),
  goalsAddressed: z
    .array(z.string())
    .describe("Treatment goals that were addressed in this session"),
  homeworkAssigned: z
    .string()
    .describe("Homework or between-session tasks assigned to the client"),
});

export async function generateSessionNote(input: {
  clientId: string;
  sessionType: string;
  moodRating: number;
  progressRating: number;
  bulletPoints: string;
}) {
  try {
    const supabase = await createClient();

    // Fetch client information
    const { data: client } = await supabase
      .from("clients")
      .select("first_name, last_name, notes, initial_session_date")
      .eq("id", input.clientId)
      .single();

    // Fetch recent sessions for context
    const { data: recentSessions } = await supabase
      .from("sessions")
      .select(
        `
        session_date,
        session_type,
        mood_rating,
        progress_rating,
        session_notes (content)
      `
      )
      .eq("client_id", input.clientId)
      .order("session_date", { ascending: false })
      .limit(3);

    // Fetch active treatment plans and goals
    const { data: treatmentPlans } = await supabase
      .from("treatment_plans")
      .select(
        `
        title,
        description,
        goals (title, description, status, progress_percentage)
      `
      )
      .eq("client_id", input.clientId)
      .eq("status", "active");

    const clientName = client
      ? `${client.first_name} ${client.last_name}`
      : "the client";
    const clientBackground =
      client?.notes || "No background information available";

    const recentSessionsSummary =
      recentSessions && recentSessions.length > 0
        ? recentSessions
            .map((s, i) => {
              const noteContent = s.session_notes?.[0]?.content || "No notes";
              return `Session ${i + 1} (${new Date(
                s.session_date
              ).toLocaleDateString()}): ${noteContent.substring(0, 200)}...`;
            })
            .join("\n")
        : "No previous sessions recorded";

    const activeGoals =
      treatmentPlans && treatmentPlans.length > 0
        ? treatmentPlans
            .flatMap((tp) => tp.goals || [])
            .map(
              (g) =>
                `- ${g.title}: ${g.description} (${g.progress_percentage}% complete)`
            )
            .join("\n")
        : "No active treatment goals";

    const prompt = `You are an experienced mental health professional writing clinical session notes. Generate a comprehensive, professional session note based on the following information:

CLIENT: ${clientName}
CLIENT BACKGROUND: ${clientBackground}

SESSION DETAILS:
- Session Type: ${input.sessionType}
- Client Mood Rating: ${input.moodRating}/10
- Progress Rating: ${input.progressRating}/10

THERAPIST'S BULLET POINTS:
${input.bulletPoints}

RECENT SESSION HISTORY:
${recentSessionsSummary}

ACTIVE TREATMENT GOALS:
${activeGoals}

Generate a professional clinical note that includes:
1. A comprehensive session summary (2-3 paragraphs) covering:
   - Client's presentation and affect
   - Topics discussed and themes explored
   - Client's responses and engagement
   - Progress toward treatment goals
   - Clinical observations and assessment

2. Specific therapeutic interventions used (e.g., CBT techniques, mindfulness exercises, psychoeducation)

3. Treatment goals addressed in this session

4. Homework or between-session tasks assigned

Use professional clinical language while being clear and specific. The note should be suitable for clinical records and insurance documentation.`;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: sessionNoteSchema,
      prompt,
    });

    return {
      success: true,
      note: object,
    };
  } catch (error) {
    console.error("[v0] Error generating session note:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate session note",
    };
  }
}

