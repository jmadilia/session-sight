import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { memberId, role } = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[v0] Update role request:", {
      memberId,
      role,
      userId: user.id,
    });

    // Call the database function to update role
    const { data, error } = await supabase.rpc("update_member_role", {
      p_member_id: memberId,
      p_new_role: role,
      p_admin_id: user.id,
    });

    if (error) {
      console.error("[v0] Update role error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[v0] Update role success:", data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Update role exception:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}
