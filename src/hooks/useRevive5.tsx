import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Revive5Category {
  id: string;
  name: string;
  icon: string;
  color_gradient: string;
  display_order: number;
  description: string | null;
}

export interface Revive5Goal {
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
  category?: Revive5Category;
}

export interface Revive5Checkin {
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
  category?: Revive5Category;
}

export function useRevive5Categories() {
  return useQuery({
    queryKey: ["revive5-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revive5_categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Revive5Category[];
    },
  });
}

export function useRevive5Goals(teamId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["revive5-goals", user?.id, teamId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("revive5_goals")
        .select("*, revive5_categories(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (teamId) query = query.eq("team_id", teamId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((g: any) => ({
        ...g,
        category: g.revive5_categories,
      })) as Revive5Goal[];
    },
    enabled: !!user,
  });
}

export function useCreateRevive5Goal() {
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
        .from("revive5_goals")
        .insert(goal)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Goal created!" });
      queryClient.invalidateQueries({ queryKey: ["revive5-goals"] });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });
}

export function useRevive5Checkins(date?: string, teamId?: string) {
  const { user } = useAuth();
  const today = date || new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["revive5-checkins", user?.id, today, teamId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("revive5_checkins")
        .select("*, revive5_categories(*)")
        .eq("user_id", user.id)
        .eq("checkin_date", today);
      if (teamId) query = query.eq("team_id", teamId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        category: c.revive5_categories,
      })) as Revive5Checkin[];
    },
    enabled: !!user,
  });
}

export function useToggleRevive5Checkin() {
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
        const { error } = await supabase
          .from("revive5_checkins")
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
        const { error } = await supabase
          .from("revive5_checkins")
          .delete()
          .eq("user_id", params.user_id)
          .eq("category_id", params.category_id)
          .eq("checkin_date", params.checkin_date);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revive5-checkins"] });
      queryClient.invalidateQueries({ queryKey: ["revive5-streaks"] });
    },
    onError: () => {
      toast({ title: "Failed to update check-in", variant: "destructive" });
    },
  });
}

export function useRevive5Streak(teamId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["revive5-streaks", user?.id, teamId],
    queryFn: async () => {
      if (!user) return null;
      const { data: checkins, error } = await supabase
        .from("revive5_checkins")
        .select("checkin_date")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("checkin_date", { ascending: false });
      if (error) throw error;
      if (!checkins?.length) return { current_streak: 0, longest_streak: 0 };

      const uniqueDates = [...new Set(checkins.map(c => c.checkin_date))].sort().reverse();
      let currentStreak = 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

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

export function useRevive5WeeklyHistory(teamId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["revive5-weekly-history", user?.id, teamId],
    queryFn: async () => {
      if (!user) return [];
      const days = 14;
      const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
      let query = supabase
        .from("revive5_checkins")
        .select("checkin_date, completed")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("checkin_date", startDate)
        .order("checkin_date", { ascending: true });
      if (teamId) query = query.eq("team_id", teamId);
      const { data, error } = await query;
      if (error) throw error;

      const countsByDate: Record<string, number> = {};
      data?.forEach((c) => {
        countsByDate[c.checkin_date] = (countsByDate[c.checkin_date] || 0) + 1;
      });

      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000);
        const dateStr = date.toISOString().split("T")[0];
        const shortLabel = date.toLocaleDateString("en-US", { weekday: "narrow", day: "numeric" });
        const fullLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        result.push({ date: dateStr, label: shortLabel, fullLabel, count: countsByDate[dateStr] || 0 });
      }
      return result;
    },
    enabled: !!user,
  });
}

export function useRevive5TeamLeaderboard(teamId?: string) {
  return useQuery({
    queryKey: ["revive5-team-leaderboard", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("user_id, player_name, role")
        .eq("team_id", teamId)
        .eq("status", "active")
        .in("role", ["player", "parent"]);
      if (membersError) throw membersError;
      if (!members?.length) return [];

      const userIds = members.map(m => m.user_id);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { data: checkins, error: checkinsError } = await supabase
        .from("revive5_checkins")
        .select("user_id, completed")
        .in("user_id", userIds)
        .gte("checkin_date", weekAgo)
        .eq("completed", true);
      if (checkinsError) throw checkinsError;

      const { data: profiles } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

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
          max_possible: 35,
        };
      }).sort((a, b) => b.weekly_checkins - a.weekly_checkins);
    },
    enabled: !!teamId,
  });
}

export function useRevive5CategoryLeaderboard(teamId?: string) {
  return useQuery({
    queryKey: ["revive5-category-leaderboard", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("user_id, player_name, role")
        .eq("team_id", teamId)
        .eq("status", "active")
        .eq("role", "player");
      if (membersError) throw membersError;
      if (!members?.length) return [];

      const userIds = members.map(m => m.user_id);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { data: checkins, error: checkinsError } = await supabase
        .from("revive5_checkins")
        .select("user_id, category_id, completed")
        .in("user_id", userIds)
        .gte("checkin_date", weekAgo)
        .eq("completed", true);
      if (checkinsError) throw checkinsError;

      const { data: profiles } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const userCategoryCounts: Record<string, Record<string, number>> = {};
      const userTotals: Record<string, number> = {};
      checkins?.forEach(c => {
        if (!userCategoryCounts[c.user_id]) userCategoryCounts[c.user_id] = {};
        userCategoryCounts[c.user_id][c.category_id] = (userCategoryCounts[c.user_id][c.category_id] || 0) + 1;
        userTotals[c.user_id] = (userTotals[c.user_id] || 0) + 1;
      });

      return members.map(m => {
        const profile = profiles?.find(p => p.user_id === m.user_id);
        return {
          user_id: m.user_id,
          name: m.player_name || profile?.display_name || "Unknown",
          avatar_url: profile?.avatar_url || null,
          total_completions: userTotals[m.user_id] || 0,
          category_completions: userCategoryCounts[m.user_id] || {},
        };
      }).sort((a, b) => b.total_completions - a.total_completions);
    },
    enabled: !!teamId,
  });
}
