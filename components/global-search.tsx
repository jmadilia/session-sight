"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Users, Calendar, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  type: "client" | "session" | "appointment";
  id: string;
  title: string;
  subtitle: string;
  date?: string;
  status?: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search function
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const searchTerm = `%${query}%`;

      // Search clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, status")
        .or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`
        )
        .limit(5);

      // Search sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select(
          `
          id,
          session_date,
          session_type,
          status,
          notes,
          clients (first_name, last_name)
        `
        )
        .or(`session_type.ilike.${searchTerm},notes.ilike.${searchTerm}`)
        .limit(5);

      // Search appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select(
          `
          id,
          appointment_date,
          status,
          notes,
          clients (first_name, last_name)
        `
        )
        .or(`notes.ilike.${searchTerm}`)
        .limit(5);

      const searchResults: SearchResult[] = [];

      // Add clients to results
      clients?.forEach((client) => {
        searchResults.push({
          type: "client",
          id: client.id,
          title: `${client.first_name} ${client.last_name}`,
          subtitle: client.email || "No email",
          status: client.status,
          href: `/dashboard/clients/${client.id}`,
        });
      });

      // Add sessions to results
      sessions?.forEach((session: any) => {
        searchResults.push({
          type: "session",
          id: session.id,
          title: `${session.clients?.first_name} ${session.clients?.last_name}`,
          subtitle: session.session_type,
          date: new Date(session.session_date).toLocaleDateString(),
          status: session.status,
          href: `/dashboard/sessions/${session.id}`,
        });
      });

      // Add appointments to results
      appointments?.forEach((appt: any) => {
        searchResults.push({
          type: "appointment",
          id: appt.id,
          title: `${appt.clients?.first_name} ${appt.clients?.last_name}`,
          subtitle: "Appointment",
          date: new Date(appt.appointment_date).toLocaleDateString(),
          status: appt.status,
          href: `/dashboard/appointments/${appt.id}`,
        });
      });

      setResults(searchResults);
      setLoading(false);
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case "client":
        return <Users className="w-4 h-4" />;
      case "session":
        return <FileText className="w-4 h-4" />;
      case "appointment":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg hover:bg-muted transition-colors w-64">
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>

          <div className="flex items-center border-b px-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients, sessions, appointments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{result.title}</p>
                        {result.status && (
                          <Badge
                            variant={
                              result.status === "active" ||
                              result.status === "completed" ||
                              result.status === "confirmed"
                                ? "default"
                                : result.status === "cancelled" ||
                                  result.status === "no-show"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs">
                            {result.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{result.type}</span>
                        {result.date && (
                          <>
                            <span>•</span>
                            <span>{result.date}</span>
                          </>
                        )}
                        {result.subtitle && (
                          <>
                            <span>•</span>
                            <span className="truncate">{result.subtitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!query && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type to search across clients, sessions, and appointments
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

