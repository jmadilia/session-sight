import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { canAccessSession } from "@/utils/permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const hasAccess = await canAccessSession(user.id, id);

  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden: You don't have access to this session" },
      { status: 403 }
    );
  }

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
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session });
}
