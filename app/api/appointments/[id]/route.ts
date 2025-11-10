import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { canAccessAppointment } from "@/utils/permissions";

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

  const hasAccess = await canAccessAppointment(user.id, id);

  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden: You don't have access to this appointment" },
      { status: 403 }
    );
  }

  // Fetch appointment with client info
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      clients (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment });
}

export async function PATCH(
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

  const hasAccess = await canAccessAppointment(user.id, id);

  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden: You don't have access to this appointment" },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Update appointment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment });
}
