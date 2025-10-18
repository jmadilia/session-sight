import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditTreatmentPlanForm } from "@/components/edit-treatment-plan-form";

interface PageProps {
  params: Promise<{ id: string; planId: string }>;
}

export default async function EditTreatmentPlanPage({ params }: PageProps) {
  const { id, planId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch treatment plan
  const { data: plan } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("id", planId)
    .eq("therapist_id", user.id)
    .single();

  if (!plan) {
    redirect(`/dashboard/clients/${id}/treatment-plans`);
  }

  // Fetch client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}/treatment-plans/${planId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Treatment Plan</h1>
          <p className="text-muted-foreground">
            {client?.first_name} {client?.last_name}
          </p>
        </div>
      </div>

      <EditTreatmentPlanForm clientId={id} plan={plan} />
    </div>
  );
}

