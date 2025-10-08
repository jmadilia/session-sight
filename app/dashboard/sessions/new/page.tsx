import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NewSessionForm } from "@/components/new-session-form";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch active clients for the dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("id, first_name, last_name")
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .order("last_name", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record Session</h1>
        <p className="text-muted-foreground mt-2">
          Document a completed therapy session
        </p>
      </div>

      <NewSessionForm
        therapistId={user.id}
        clients={clients || []}
        preselectedClientId={searchParams.client}
      />
    </div>
  );
}
