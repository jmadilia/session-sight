import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, supervisedBy } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    console.log("[v0] Updating supervisor assignment:", {
      memberId,
      supervisedBy: supervisedBy || "none",
    });

    const { data, error } = await supabase.rpc("update_supervised_by", {
      p_member_id: memberId,
      p_supervised_by: supervisedBy || null,
      p_user_id: user.id,
    });

    console.log("[v0] Update supervisor result:", data, "Error:", error);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && typeof data === "object" && "error" in data) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error in update-supervisor route:", error);
    return NextResponse.json(
      { error: "Failed to update supervisor assignment" },
      { status: 500 }
    );
  }
}
