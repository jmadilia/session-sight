import { createClient } from "@/utils/supabase/server";
import { getUserOrgContext } from "@/utils/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = await getUserOrgContext(user.id);

  return NextResponse.json({
    role: context.role,
    organizationId: context.organizationId,
    isInOrganization: context.isInOrganization,
  });
}
