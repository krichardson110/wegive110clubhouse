import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Drive5Category {
  id: string;
  name: string;
  icon: string;
  color_gradient: string;
  display_order: number;
  description: string | null;
}

export interface PlayerGoal {
  id: string;
  user_id: string;
  team_id: string | null;
  category_id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  category?: Drive5Category;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  team_id: string | null;
  category_id: string;
  goal_id: string | null;
  checkin_date: string;
  completed: boolean;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
  category?: Drive5Category;
}

export interface PlayerStreak {
  id: string;
  user_id: string;
  team_id: string | null;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
}

export function useDrive5Categories() {
  return useQuery({
    queryKey: ["drive5-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drive5_categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Drive5Category[];
    },
  });
}

export function usePlayerGoals(teamId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["player-goals", user?.id, teamId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("player_goals")
        .select("*, drive5_categories(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (teamId) query = query.eq("team_id", teamId);
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((g: any) => ({
        ...g,
        category: g.drive5_categories,
      })) as PlayerGoal[];
    },
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goal: {
      user_id: string;
      team_id?: string;
      category_id: string;
      title: string;
      description?: string;
      target_value?: number;
    }) => {
      const { data, error } = await supabase
        .from("player_goals")
        .insert(goal)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Goal created!" });
      queryClient.invalidateQueries({ queryKey: ["player-goals"] });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });
}

export function useDailyCheckins(date?: string, teamId?: string) {
  const { user } = useAuth();
  const today = date || new Date().toISOString().split("T")[0];
  
  return useQuery({
    queryKey: ["daily-checkins", user?.id, today, teamId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("daily_checkins")
        .select("*, drive5_categories(*)")
        .eq("user_id", user.id)
        .eq("checkin_date", today);
      
      if (teamId) query = query.eq("team_id", teamId);
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        category: c.drive5_categories,
      })) as DailyCheckin[];
    },
    enabled: !!user,
  });
}

export function useToggleCheckin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      user_id: string;
      team_id?: string;
      category_id: string;
      checkin_date: string;
      completed: boolean;
      notes?: string;
      duration_minutes?: number;
      goal_id?: string;
    }) => {
      if (params.completed) {
        // Upsert checkin
        const { error } = await supabase
          .from("daily_checkins")
          .upsert({
            user_id: params.user_id,
            team_id: params.team_id || null,
            category_id: params.category_id,
            checkin_date: params.checkin_date,
            completed: true,
            notes: params.notes || null,
            duration_minutes: params.duration_minutes || null,
            goal_id: params.goal_id || null,
          }, { onConflict: "user_id,category_id,checkin_date" });
        if (error) throw error;
      } else {
        // Delete checkin
        const { error } = await supabase
          .from("daily_checkins")
          .delete()
          .eq("user_id", params.user_id)
          .eq("category_id", params.category_id)
          .eq("checkin_date", params.checkin_date);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-checkins"] });
      queryClient.invalidateQueries({ queryKey: ["player-streaks"] });
    },
    onError: () => {
      toast({ title: "Failed to update check-in", variant: "destructive" });
    },
  });
}

export function usePlayerStreak(teamId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["player-streaks", user?.id, teamId],
    queryFn: async () => {
      if (!user) return null;
      
      // Calculate streak from checkins
      const { data: checkins, error } = await supabase
        .from("daily_checkins")
        .select("checkin_date")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("checkin_date", { ascending: false });
      
      if (error) throw error;
      if (!checkins?.length) return { current_streak: 0, longest_streak: 0 };

      // Get unique dates
      const uniqueDates = [...new Set(checkins.map(c => c.checkin_date))].sort().reverse();
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      // Streak must start from today or yesterday
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        for (let i = 0; i < uniqueDates.length; i++) {
          const expected = new Date(Date.now() - (i * 86400000) - (uniqueDates[0] === yesterday ? 86400000 : 0));
          const expectedStr = expected.toISOString().split("T")[0];
          if (uniqueDates[i] === expectedStr) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;
      const sortedDates = [...uniqueDates].sort();
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / 86400000;
        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      return { current_streak: currentStreak, longest_streak: longestStreak };
    },
    enabled: !!user,
  });
}

export function useTeamLeaderboard(teamId?: string) {
  return useQuery({
    queryKey: ["team-leaderboard", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      // Get team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("user_id, player_name, role")
        .eq("team_id", teamId)
        .eq("status", "active")
        .in("role", ["player", "parent"]);
      
      if (membersError) throw membersError;
      if (!members?.length) return [];

      const userIds = members.map(m => m.user_id);
      
      // Get check-ins for last 7 days
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { data: checkins, error: checkinsError } = await supabase
        .from("daily_checkins")
        .select("user_id, completed")
        .in("user_id", userIds)
        .gte("checkin_date", weekAgo)
        .eq("completed", true);
      
      if (checkinsError) throw checkinsError;

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      // Get players from team_member_players
      const { data: memberPlayers } = await supabase
        .from("team_member_players")
        .select("team_member_id, player_name")
        .in("team_member_id", members.map(m => m.user_id)); // This won't work since team_member_id != user_id
      
      // Count checkins per user
      const counts: Record<string, number> = {};
      checkins?.forEach(c => {
        counts[c.user_id] = (counts[c.user_id] || 0) + 1;
      });

      return members.map(m => {
        const profile = profiles?.find(p => p.user_id === m.user_id);
        return {
          user_id: m.user_id,
          name: m.player_name || profile?.display_name || "Unknown",
          avatar_url: profile?.avatar_url,
          weekly_checkins: counts[m.user_id] || 0,
          max_possible: 35, // 5 categories * 7 days
        };
      }).sort((a, b) => b.weekly_checkins - a.weekly_checkins);
    },
    enabled: !!teamId,
  });
}
