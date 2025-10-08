import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NewClientForm } from "@/components/new-client-form";

export default async function NewClientPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
        <p className="text-muted-foreground mt-2">
          Enter client information to add them to your roster
        </p>
      </div>

      <NewClientForm therapistId={user.id} />
    </div>
  );
}
