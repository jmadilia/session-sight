import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NewAppointmentForm } from "@/components/new-appointment-form";

export default async function NewAppointmentPage(props: any) {
  const { searchParams } = props as { searchParams: { client?: string } };
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, first_name, last_name")
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .order("last_name", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Schedule Appointment
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new appointment for a client
        </p>
      </div>

      <NewAppointmentForm
        therapistId={user.id}
        clients={clients || []}
        preselectedClientId={searchParams.client}
      />
    </div>
  );
}
