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
      therapists: {
        Row: {
          id: string;
          license_number: string | null;
          specialization: string[] | null;
          practice_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          license_number?: string | null;
          specialization?: string[] | null;
          practice_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          license_number?: string | null;
          specialization?: string[] | null;
          practice_name?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          therapist_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          initial_session_date: string | null;
          status: "active" | "inactive" | "discharged";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          initial_session_date?: string | null;
          status?: "active" | "inactive" | "discharged";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          initial_session_date?: string | null;
          status?: "active" | "inactive" | "discharged";
          notes?: string | null;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          therapist_id: string;
          client_id: string;
          session_date: string;
          duration_minutes: number;
          session_type: "individual" | "couples" | "family" | "group";
          status: "scheduled" | "completed" | "cancelled" | "no-show";
          mood_rating: number | null;
          progress_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          client_id: string;
          session_date: string;
          duration_minutes?: number;
          session_type?: "individual" | "couples" | "family" | "group";
          status?: "scheduled" | "completed" | "cancelled" | "no-show";
          mood_rating?: number | null;
          progress_rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          client_id?: string;
          session_date?: string;
          duration_minutes?: number;
          session_type?: "individual" | "couples" | "family" | "group";
          status?: "scheduled" | "completed" | "cancelled" | "no-show";
          mood_rating?: number | null;
          progress_rating?: number | null;
          updated_at?: string;
        };
      };
      session_notes: {
        Row: {
          id: string;
          session_id: string;
          content: string;
          interventions: string[] | null;
          goals_addressed: string[] | null;
          homework_assigned: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          content: string;
          interventions?: string[] | null;
          goals_addressed?: string[] | null;
          homework_assigned?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          content?: string;
          interventions?: string[] | null;
          goals_addressed?: string[] | null;
          homework_assigned?: string | null;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          therapist_id: string;
          client_id: string;
          appointment_date: string;
          duration_minutes: number;
          status: "scheduled" | "confirmed" | "cancelled" | "completed";
          cancellation_reason: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          client_id: string;
          appointment_date: string;
          duration_minutes?: number;
          status?: "scheduled" | "confirmed" | "cancelled" | "completed";
          cancellation_reason?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          client_id?: string;
          appointment_date?: string;
          duration_minutes?: number;
          status?: "scheduled" | "confirmed" | "cancelled" | "completed";
          cancellation_reason?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      client_metrics: {
        Row: {
          id: string;
          client_id: string;
          metric_date: string;
          attendance_rate: number | null;
          cancellation_count: number;
          no_show_count: number;
          engagement_score: number | null;
          risk_level: "low" | "medium" | "high" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          metric_date: string;
          attendance_rate?: number | null;
          cancellation_count?: number;
          no_show_count?: number;
          engagement_score?: number | null;
          risk_level?: "low" | "medium" | "high" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          metric_date?: string;
          attendance_rate?: number | null;
          cancellation_count?: number;
          no_show_count?: number;
          engagement_score?: number | null;
          risk_level?: "low" | "medium" | "high" | null;
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
