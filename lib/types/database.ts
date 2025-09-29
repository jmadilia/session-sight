export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          mood_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          mood_score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          mood_score?: number;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string | null;
        };
      };
      entry_tags: {
        Row: {
          id: string;
          entry_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          tag_id?: string;
        };
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          entry_id: string;
          sentiment_score: number | null;
          key_themes: string[] | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_id: string;
          sentiment_score?: number | null;
          key_themes?: string[] | null;
          generated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_id?: string;
          sentiment_score?: number | null;
          key_themes?: string[] | null;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
