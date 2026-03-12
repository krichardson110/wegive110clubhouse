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
      admin_permissions: {
        Row: {
          created_at: string
          enabled: boolean
          granted_by: string | null
          id: string
          permission: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          granted_by?: string | null
          id?: string
          permission: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          granted_by?: string | null
          id?: string
          permission?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      batting_lineups: {
        Row: {
          batting_order: number
          created_at: string
          id: string
          inning_enter: number | null
          is_substitute: boolean
          notes: string | null
          player_name: string
          position: string
          substitutes_for: number | null
          team_id: string
          team_member_id: string | null
          updated_at: string
        }
        Insert: {
          batting_order: number
          created_at?: string
          id?: string
          inning_enter?: number | null
          is_substitute?: boolean
          notes?: string | null
          player_name: string
          position: string
          substitutes_for?: number | null
          team_id: string
          team_member_id?: string | null
          updated_at?: string
        }
        Update: {
          batting_order?: number
          created_at?: string
          id?: string
          inning_enter?: number | null
          is_substitute?: boolean
          notes?: string | null
          player_name?: string
          position?: string
          substitutes_for?: number | null
          team_id?: string
          team_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batting_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batting_lineups_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          category_id: string
          checkin_date: string
          completed: boolean
          created_at: string
          duration_minutes: number | null
          goal_id: string | null
          id: string
          notes: string | null
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          checkin_date?: string
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          checkin_date?: string
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "drive5_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_checkins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "player_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_checkins_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      depth_chart: {
        Row: {
          created_at: string
          depth_order: number
          id: string
          notes: string | null
          player_name: string
          position: string
          team_id: string
          team_member_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          depth_order?: number
          id?: string
          notes?: string | null
          player_name: string
          position: string
          team_id: string
          team_member_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          depth_order?: number
          id?: string
          notes?: string | null
          player_name?: string
          position?: string
          team_id?: string
          team_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "depth_chart_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depth_chart_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      drive5_categories: {
        Row: {
          color_gradient: string
          created_at: string
          description: string | null
          display_order: number
          icon: string
          id: string
          name: string
        }
        Insert: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          name: string
        }
        Update: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      exercise_responses: {
        Row: {
          chapter_id: string
          completed_at: string
          created_at: string
          exercise_id: string
          id: string
          response_text: string | null
          time_spent_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string
          created_at?: string
          exercise_id: string
          id?: string
          response_text?: string | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string
          created_at?: string
          exercise_id?: string
          id?: string
          response_text?: string | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_responses_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_tasks: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          goal_id: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "drive5_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "player_goals"
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
      player_goals: {
        Row: {
          category_id: string
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          target_value: number | null
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          target_value?: number | null
          team_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          target_value?: number | null
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "drive5_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_goals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_streaks: {
        Row: {
          current_streak: number
          id: string
          last_checkin_date: string | null
          longest_streak: number
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_streaks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
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
      practice_drills: {
        Row: {
          coaching_points: string[] | null
          created_at: string
          description: string | null
          diagram_url: string | null
          drill_name: string
          drill_number: number | null
          drill_order: number
          duration_minutes: number | null
          id: string
          notes: string | null
          phase_name: string
          practice_id: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          coaching_points?: string[] | null
          created_at?: string
          description?: string | null
          diagram_url?: string | null
          drill_name: string
          drill_number?: number | null
          drill_order?: number
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          phase_name: string
          practice_id: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          coaching_points?: string[] | null
          created_at?: string
          description?: string | null
          diagram_url?: string | null
          drill_name?: string
          drill_number?: number | null
          drill_order?: number
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          phase_name?: string
          practice_id?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_drills_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number | null
          focus_areas: string[] | null
          id: string
          is_public: boolean
          phase: Database["public"]["Enums"]["practice_phase"] | null
          season: Database["public"]["Enums"]["practice_season"] | null
          team_id: string | null
          template_drills: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          is_public?: boolean
          phase?: Database["public"]["Enums"]["practice_phase"] | null
          season?: Database["public"]["Enums"]["practice_season"] | null
          team_id?: string | null
          template_drills?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          is_public?: boolean
          phase?: Database["public"]["Enums"]["practice_phase"] | null
          season?: Database["public"]["Enums"]["practice_season"] | null
          team_id?: string | null
          template_drills?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      practices: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          equipment_needed: string[] | null
          focus_areas: string[] | null
          id: string
          location: string | null
          notes: string | null
          phase: Database["public"]["Enums"]["practice_phase"]
          practice_date: string
          published: boolean
          season: Database["public"]["Enums"]["practice_season"]
          start_time: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          equipment_needed?: string[] | null
          focus_areas?: string[] | null
          id?: string
          location?: string | null
          notes?: string | null
          phase?: Database["public"]["Enums"]["practice_phase"]
          practice_date: string
          published?: boolean
          season?: Database["public"]["Enums"]["practice_season"]
          start_time: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          equipment_needed?: string[] | null
          focus_areas?: string[] | null
          id?: string
          location?: string | null
          notes?: string | null
          phase?: Database["public"]["Enums"]["practice_phase"]
          practice_date?: string
          published?: boolean
          season?: Database["public"]["Enums"]["practice_season"]
          start_time?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comments_count: number
          created_at: string
          display_name: string | null
          force_password_change: boolean | null
          id: string
          likes_given_count: number
          posts_count: number
          temp_password_set_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number
          created_at?: string
          display_name?: string | null
          force_password_change?: boolean | null
          id?: string
          likes_given_count?: number
          posts_count?: number
          temp_password_set_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number
          created_at?: string
          display_name?: string | null
          force_password_change?: boolean | null
          id?: string
          likes_given_count?: number
          posts_count?: number
          temp_password_set_at?: string | null
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
      revive5_categories: {
        Row: {
          color_gradient: string
          created_at: string
          description: string | null
          display_order: number
          icon: string
          id: string
          name: string
        }
        Insert: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          name: string
        }
        Update: {
          color_gradient?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      revive5_checkins: {
        Row: {
          category_id: string
          checkin_date: string
          completed: boolean
          created_at: string
          duration_minutes: number | null
          goal_id: string | null
          id: string
          notes: string | null
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          checkin_date?: string
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          checkin_date?: string
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revive5_checkins_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "revive5_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revive5_checkins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "revive5_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revive5_checkins_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      revive5_goal_tasks: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          goal_id: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revive5_goal_tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "revive5_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revive5_goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "revive5_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      revive5_goals: {
        Row: {
          category_id: string
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          target_value: number | null
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          target_value?: number | null
          team_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          target_value?: number | null
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revive5_goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "revive5_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revive5_goals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      revive5_task_completions: {
        Row: {
          completed: boolean
          completion_date: string
          created_at: string
          id: string
          notes: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completion_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completion_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revive5_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "revive5_goal_tasks"
            referencedColumns: ["id"]
          },
        ]
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
          practice_id: string | null
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
          practice_id?: string | null
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
          practice_id?: string | null
          published?: boolean
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          completed: boolean
          completion_date: string
          created_at: string
          id: string
          notes: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completion_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completion_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "goal_tasks"
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
      team_member_players: {
        Row: {
          created_at: string
          id: string
          player_name: string
          player_number: string | null
          position: string | null
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_name: string
          player_number?: string | null
          position?: string | null
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          player_name?: string
          player_number?: string | null
          position?: string | null
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_players_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
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
      user_activity_logs: {
        Row: {
          created_at: string
          id: string
          left_at: string | null
          page_path: string
          page_title: string | null
          time_spent_seconds: number | null
          user_id: string
          visited_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          left_at?: string | null
          page_path: string
          page_title?: string | null
          time_spent_seconds?: number | null
          user_id: string
          visited_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          left_at?: string | null
          page_path?: string
          page_title?: string | null
          time_spent_seconds?: number | null
          user_id?: string
          visited_at?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      video_watch_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_watch_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
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
      workout_favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_favorites_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
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
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comments_count: number | null
          created_at: string | null
          display_name: string | null
          id: string | null
          likes_given_count: number | null
          posts_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          likes_given_count?: number | null
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          likes_given_count?: number | null
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_team_invitation: {
        Args: { invite_token: string }
        Returns: string
      }
      get_invitation_by_token: {
        Args: { invite_token: string }
        Returns: {
          accepted_at: string
          expires_at: string
          id: string
          invite_type: string
          player_name: string
          team_id: string
        }[]
      }
      get_team_id_from_member: { Args: { member_id: string }; Returns: string }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_team_coach: { Args: { team_uuid: string }; Returns: boolean }
      is_team_member: { Args: { team_uuid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "coach" | "player" | "parent" | "user"
      practice_phase:
        | "off-season"
        | "pre-season"
        | "in-season"
        | "post-season"
        | "strength"
        | "speed"
        | "skills"
      practice_season: "fall" | "spring" | "summer" | "winter"
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
    Enums: {
      app_role: ["super_admin", "admin", "coach", "player", "parent", "user"],
      practice_phase: [
        "off-season",
        "pre-season",
        "in-season",
        "post-season",
        "strength",
        "speed",
        "skills",
      ],
      practice_season: ["fall", "spring", "summer", "winter"],
    },
  },
} as const
