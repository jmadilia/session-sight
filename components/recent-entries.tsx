import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight } from "lucide-react";

export async function RecentEntries({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("entries")
    .select("id, title, content, mood_score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Entries</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/entries">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {entries && entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/dashboard/entries/${entry.id}`}
                className="block group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {entry.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(entry.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {entry.mood_score && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {entry.mood_score}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No entries yet</p>
            <Button asChild>
              <Link href="/dashboard/new-entry">Create Your First Entry</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
