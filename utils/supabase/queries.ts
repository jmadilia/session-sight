import { createClient } from "./server";
import { createClient as createBrowserClient } from "./client";
import type { TablesInsert, TablesUpdate } from "@/lib/types/database";

// Entry operations
export async function getEntries(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entries")
    .select(
      `
      *,
      entry_tags (
        tags (*)
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createEntry(entry: TablesInsert<"entries">) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entries")
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEntry(
  id: string,
  updates: TablesUpdate<"entries">
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("entries").delete().eq("id", id);

  if (error) throw error;
}

// Tag operations
export async function getTags() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("tags").select("*").order("name");

  if (error) throw error;
  return data;
}

export async function createTag(tag: TablesInsert<"tags">) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .insert(tag)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Entry-Tag associations
export async function addTagToEntry(entryId: string, tagId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entry_tags")
    .insert({ entry_id: entryId, tag_id: tagId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeTagFromEntry(entryId: string, tagId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("entry_tags")
    .delete()
    .eq("entry_id", entryId)
    .eq("tag_id", tagId);

  if (error) throw error;
}

// Profile operations
export async function getProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: TablesUpdate<"profiles">
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Analytics operations
export async function getMoodTrends(userId: string, days = 30) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entries")
    .select("mood_score, created_at")
    .eq("user_id", userId)
    .gte(
      "created_at",
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function getTopTags(userId: string, limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entry_tags")
    .select(
      `
      tag_id,
      tags (name, color),
      count:entry_id
    `
    )
    .eq("entries.user_id", userId)
    .limit(limit);

  if (error) throw error;
  return data;
}

// Client-side operations (for use in components)
export function createClientQueries() {
  const supabase = createBrowserClient();

  return {
    async getEntriesClient(userId: string) {
      const { data, error } = await supabase
        .from("entries")
        .select(
          `
          *,
          entry_tags (
            tags (*)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async createEntryClient(entry: TablesInsert<"entries">) {
      const { data, error } = await supabase
        .from("entries")
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateEntryClient(id: string, updates: TablesUpdate<"entries">) {
      const { data, error } = await supabase
        .from("entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  };
}
