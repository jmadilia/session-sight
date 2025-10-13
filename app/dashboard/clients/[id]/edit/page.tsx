import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { EditClientForm } from "@/components/edit-client-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/dashboard/clients/${client.id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
          <p className="text-muted-foreground mt-1">
            Update information for {client.first_name} {client.last_name}
          </p>
        </div>
      </div>

      <EditClientForm client={client} />
    </div>
  );
}

