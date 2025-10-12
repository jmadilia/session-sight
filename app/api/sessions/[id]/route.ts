import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: any) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // Fetch session with client and notes
  const { data: session, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      clients (
        id,
        first_name,
        last_name,
        email
      ),
      session_notes (
        id,
        content,
        interventions,
        goals_addressed,
        homework_assigned
      )
    `
    )
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session });
}

