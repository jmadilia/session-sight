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

  // Fetch sessions with client info
  const { data: sessions, error } = await supabase
    .from("sessions")
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
    .order("session_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Insert new session
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      ...body,
      therapist_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If session notes are provided, insert them
  if (body.notes) {
    const { error: notesError } = await supabase.from("session_notes").insert({
      session_id: session.id,
      content: body.notes.content || "",
      interventions: body.notes.interventions || [],
      goals_addressed: body.notes.goals_addressed || [],
      homework_assigned: body.notes.homework_assigned || "",
    });

    if (notesError) {
      console.error("Error creating session notes:", notesError);
    }
  }

  return NextResponse.json({ session }, { status: 201 });
}

