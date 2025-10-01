import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get entries for the user
    const { data: entries, error } = await supabase
      .from("entries")
      .select(
        `
        *,
        entry_tags (
          tags (*)
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, mood_score, tags } = body;

    // Create the entry
    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .insert({
        user_id: user.id,
        title,
        content,
        mood_score,
      })
      .select()
      .single();

    if (entryError) {
      return NextResponse.json({ error: entryError.message }, { status: 500 });
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagAssociations = tags.map((tagId: string) => ({
        entry_id: entry.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from("entry_tags")
        .insert(tagAssociations);

      if (tagError) {
        console.error("Error adding tags:", tagError);
      }
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
