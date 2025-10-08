import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function MoodChart({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("entries")
    .select("mood_score, created_at")
    .eq("user_id", userId)
    .not("mood_score", "is", null)
    .order("created_at", { ascending: true })
    .limit(30);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {entries && entries.length > 0 ? (
          <div className="h-[200px] flex items-end justify-between gap-2">
            {entries.map((entry, index) => {
              const height = ((entry.mood_score || 0) / 10) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t relative group"
                  style={{ height: `${height}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                    {entry.mood_score}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No mood data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
