"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ClientsFilter } from "@/components/clients-filter";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
  notes: string | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("therapist_id", user.id)
        .order("last_name", { ascending: true });

      setClients(data || []);
      setFilteredClients(data || []);
      setLoading(false);
    };

    fetchClients();
  }, []);

  // Filter clients based on search and filters
  useEffect(() => {
    let filtered = clients;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.first_name.toLowerCase().includes(query) ||
          client.last_name.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((client) =>
        statusFilter.includes(client.status)
      );
    }

    setFilteredClients(filtered);
  }, [searchQuery, statusFilter, clients]);

  const clearFilters = () => {
    setStatusFilter([]);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ClientsFilter
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onClearFilters={clearFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <div className="space-y-4">
              {filteredClients.map((client) => (
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
              {searchQuery || statusFilter.length > 0 ? (
                <>
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No clients found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
