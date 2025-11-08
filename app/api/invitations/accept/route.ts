import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invitationId } = await request.json();

  console.log("[v0] Accepting invitation:", invitationId, "for user:", user.id);

  if (!invitationId) {
    return NextResponse.json(
      { error: "Invalid invitation ID" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("accept_organization_invitation", {
    p_invitation_id: invitationId,
    p_user_id: user.id,
  });

  console.log("[v0] Accept result:", data);
  console.log("[v0] Accept error:", error);

  if (error) {
    console.error("[v0] Error accepting invitation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.success) {
    return NextResponse.json(
      { error: data?.error || "Failed to accept invitation" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
