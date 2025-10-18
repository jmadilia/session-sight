import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewProgressUpdateForm } from "@/components/new-progress-update-form";

interface PageProps {
  params: Promise<{ id: string; planId: string; goalId: string }>;
}

export default async function NewProgressUpdatePage({ params }: PageProps) {
  const { id, planId, goalId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify goal exists
  const { data: goal } = await supabase
    .from("goals")
    .select("*, treatment_plans(*)")
    .eq("id", goalId)
    .single();

  if (!goal || goal.treatment_plans.therapist_id !== user.id) {
    redirect(`/dashboard/clients/${id}/treatment-plans/${planId}`);
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
          <h1 className="text-3xl font-bold">Add Progress Update</h1>
          <p className="text-muted-foreground">
            {client?.first_name} {client?.last_name} - {goal.title}
          </p>
        </div>
      </div>

      <NewProgressUpdateForm clientId={id} planId={planId} goalId={goalId} />
    </div>
  );
}

