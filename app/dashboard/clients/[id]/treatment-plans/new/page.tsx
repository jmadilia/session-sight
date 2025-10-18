import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewTreatmentPlanForm } from "@/components/new-treatment-plan-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewTreatmentPlanPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (!client) {
    redirect("/dashboard/clients");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}/treatment-plans`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Treatment Plan</h1>
          <p className="text-muted-foreground">
            {client.first_name} {client.last_name}
          </p>
        </div>
      </div>

      <NewTreatmentPlanForm clientId={id} />
    </div>
  );
}

