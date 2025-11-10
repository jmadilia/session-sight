import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getAccessibleTherapistIds } from "@/utils/permissions";

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

  const accessibleTherapistIds = await getAccessibleTherapistIds(user.id);

  console.log(
    "[v0] GET /api/clients - accessibleTherapistIds:",
    accessibleTherapistIds
  );

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .in("therapist_id", accessibleTherapistIds)
    .order("created_at", { ascending: false });

  console.log("[v0] GET /api/clients - query error:", error);
  console.log("[v0] GET /api/clients - clients count:", clients?.length || 0);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clients });
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

  // Insert new client
  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      ...body,
      therapist_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client }, { status: 201 });
}
