export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          auto_criteria: Json | null
          badge_type: string
          color_gradient: string
          created_at: string
          description: string | null
          display_order: number
          icon_name: string
          id: string
          name: string
        }
        Insert: {
          auto_criteria?: Json | null
          badge_type?: string
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          name: string
        }
        Update: {
          auto_criteria?: Json | null
          badge_type?: string
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          chapter_order: number
          color_gradient: string | null
          created_at: string
          description: string | null
          exercises: Json | null
          icon_name: string | null
          id: string
          journey_id: string
          key_takeaways: Json | null
          published: boolean
          readings: Json | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          chapter_number?: number
          chapter_order?: number
          color_gradient?: string | null
          created_at?: string
          description?: string | null
          exercises?: Json | null
          icon_name?: string | null
          id?: string
          journey_id: string
          key_takeaways?: Json | null
          published?: boolean
          readings?: Json | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          chapter_order?: number
          color_gradient?: string | null
          created_at?: string
          description?: string | null
          exercises?: Json | null
          icon_name?: string | null
          id?: string
          journey_id?: string
          key_takeaways?: Json | null
          published?: boolean
          readings?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          color_gradient: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          journey_order: number
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          color_gradient?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          journey_order?: number
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          color_gradient?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          journey_order?: number
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          media_urls: Json | null
          published: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          media_urls?: Json | null
          published?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          media_urls?: Json | null
          published?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comments_count: number
          created_at: string
          display_name: string | null
          id: string
          likes_given_count: number
          posts_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number
          created_at?: string
          display_name?: string | null
          id?: string
          likes_given_count?: number
          posts_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number
          created_at?: string
          display_name?: string | null
          id?: string
          likes_given_count?: number
          posts_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      return_report_recordings: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          duration: string | null
          external_url: string | null
          id: string
          published: boolean
          recording_date: string
          title: string
          updated_at: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          external_url?: string | null
          id?: string
          published?: boolean
          recording_date?: string
          title: string
          updated_at?: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          external_url?: string | null
          id?: string
          published?: boolean
          recording_date?: string
          title?: string
          updated_at?: string
          youtube_id?: string | null
        }
        Relationships: []
      }
      return_report_settings: {
        Row: {
          google_meet_url: string | null
          id: string
          meet_description: string | null
          meet_title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          google_meet_url?: string | null
          id?: string
          meet_description?: string | null
          meet_title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          google_meet_url?: string | null
          id?: string
          meet_description?: string | null
          meet_title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          attachments: Json | null
          created_at: string
          end_time: string | null
          event_date: string
          event_time: string
          event_type: string
          id: string
          is_home: boolean | null
          location: string | null
          notes: string | null
          opponent: string | null
          published: boolean
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          end_time?: string | null
          event_date: string
          event_time: string
          event_type?: string
          id?: string
          is_home?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          published?: boolean
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          end_time?: string | null
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          is_home?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          published?: boolean
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_events: {
        Row: {
          created_at: string
          created_by: string
          end_time: string | null
          event_date: string
          event_time: string
          event_type: string
          id: string
          is_home: boolean | null
          location: string | null
          notes: string | null
          opponent: string | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_time?: string | null
          event_date: string
          event_time: string
          event_type?: string
          id?: string
          is_home?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_time?: string | null
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          is_home?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_type: string
          invited_by: string
          player_name: string | null
          team_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_type?: string
          invited_by: string
          player_name?: string | null
          team_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_type?: string
          invited_by?: string
          player_name?: string | null
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          parent_email: string | null
          player_name: string | null
          player_number: string | null
          position: string | null
          role: string
          status: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          parent_email?: string | null
          player_name?: string | null
          player_number?: string | null
          position?: string | null
          role?: string
          status?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          parent_email?: string | null
          player_name?: string | null
          player_number?: string | null
          position?: string | null
          role?: string
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "team_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          media_urls: Json | null
          published: boolean
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          media_urls?: Json | null
          published?: boolean
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          media_urls?: Json | null
          published?: boolean
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string | null
          logo_url: string | null
          name: string
          season: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          name: string
          season?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          name?: string
          season?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      training_logs: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          intensity: string | null
          logged_at: string
          notes: string | null
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          logged_at?: string
          notes?: string | null
          team_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          logged_at?: string
          notes?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      video_categories: {
        Row: {
          color_gradient: string
          created_at: string
          description: string | null
          display_order: number
          icon_name: string
          id: string
          name: string
          published: boolean
          updated_at: string
        }
        Insert: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          name: string
          published?: boolean
          updated_at?: string
        }
        Update: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          name?: string
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          display_order: number
          duration: string | null
          id: string
          published: boolean
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          id?: string
          published?: boolean
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "video_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          duration: string | null
          id: string
          published: boolean
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          id?: string
          published?: boolean
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: []
      }
      workout_categories: {
        Row: {
          color_gradient: string
          created_at: string
          description: string | null
          display_order: number
          icon_name: string
          id: string
          name: string
          published: boolean
          updated_at: string
        }
        Insert: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          name: string
          published?: boolean
          updated_at?: string
        }
        Update: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          name?: string
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          difficulty: string
          display_order: number
          duration: string | null
          exercises: number
          id: string
          published: boolean
          title: string
          updated_at: string
          youtube_id: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          difficulty?: string
          display_order?: number
          duration?: string | null
          exercises?: number
          id?: string
          published?: boolean
          title: string
          updated_at?: string
          youtube_id?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          display_order?: number
          duration?: string | null
          exercises?: number
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "workout_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_admin: { Args: never; Returns: boolean }
      is_team_coach: { Args: { team_uuid: string }; Returns: boolean }
      is_team_member: { Args: { team_uuid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
