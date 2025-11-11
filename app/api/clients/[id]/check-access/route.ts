import { createClient } from "@/utils/supabase/server";
import { getAccessibleTherapistIds } from "@/utils/permissions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasAccess: false }, { status: 401 });
  }

  const { id } = await params;
  const clientId = id;

  // Get accessible therapist IDs based on user's role
  const accessibleTherapistIds = await getAccessibleTherapistIds(user.id);

  // Check if the client belongs to an accessible therapist
  const { data: client } = await supabase
    .from("clients")
    .select("therapist_id")
    .eq("id", clientId)
    .single();

  if (!client || !accessibleTherapistIds.includes(client.therapist_id)) {
    return NextResponse.json({ hasAccess: false }, { status: 403 });
  }

  return NextResponse.json({ hasAccess: true });
}
