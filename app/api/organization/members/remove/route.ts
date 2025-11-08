import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { memberId } = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[v0] Remove member request:", { memberId, userId: user.id });

    // Call the database function to remove member
    const { data, error } = await supabase.rpc("remove_organization_member", {
      p_member_id: memberId,
      p_admin_id: user.id,
    });

    if (error) {
      console.error("[v0] Remove member error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[v0] Remove member success:", data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Remove member exception:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
