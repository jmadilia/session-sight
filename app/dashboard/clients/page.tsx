import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react"; // Added import for Users

export default async function ClientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("therapist_id", user.id)
    .order("last_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Clients
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your client roster and track engagement
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/clients/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search clients..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clients && clients.length > 0 ? (
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">
                          {client.first_name} {client.last_name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {client.email || "No email"}
                          </p>
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : client.status === "inactive"
                                ? "secondary"
                                : "outline"
                            }
                            className="w-fit">
                            {client.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {client.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {client.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto bg-transparent">
                      <Link href={`/dashboard/clients/${client.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first client
              </p>
              <Button asChild>
                <Link href="/dashboard/clients/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
