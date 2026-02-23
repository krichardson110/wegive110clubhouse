import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface GoalTask {
  id: string;
  goal_id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  completion_date: string;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export function useGoalTasks(goalId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goal-tasks", goalId],
    queryFn: async () => {
      if (!user || !goalId) return [];
      const { data, error } = await supabase
        .from("goal_tasks")
        .select("*")
        .eq("goal_id", goalId)
        .eq("is_active", true)
        .order("created_at");
      if (error) throw error;
      return data as GoalTask[];
    },
    enabled: !!user && !!goalId,
  });
}

export function useAllActiveGoalTasks(teamId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["all-goal-tasks", user?.id, teamId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("goal_tasks")
        .select("*, player_goals!inner(id, title, category_id, team_id, status), drive5_categories(*)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("player_goals.status", "active")
        .order("created_at");
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        goal: t.player_goals,
        category: t.drive5_categories,
      }));
    },
    enabled: !!user,
  });
}

export function useTaskCompletions(date?: string) {
  const { user } = useAuth();
  const today = date || new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["task-completions", user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("task_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("completion_date", today);
      if (error) throw error;
      return data as TaskCompletion[];
    },
    enabled: !!user,
  });
}

export function useCreateGoalTask() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: {
      goal_id: string;
      user_id: string;
      category_id: string;
      title: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("goal_tasks")
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Task added!" });
      queryClient.invalidateQueries({ queryKey: ["goal-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-goal-tasks"] });
    },
    onError: () => {
      toast({ title: "Failed to add task", variant: "destructive" });
    },
  });
}

export function useDeleteGoalTask() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("goal_tasks")
        .update({ is_active: false })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Task removed" });
      queryClient.invalidateQueries({ queryKey: ["goal-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-goal-tasks"] });
    },
    onError: () => {
      toast({ title: "Failed to remove task", variant: "destructive" });
    },
  });
}

export function useToggleTaskCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      task_id: string;
      user_id: string;
      completion_date: string;
      completed: boolean;
    }) => {
      if (params.completed) {
        const { error } = await supabase
          .from("task_completions")
          .upsert({
            task_id: params.task_id,
            user_id: params.user_id,
            completion_date: params.completion_date,
            completed: true,
          }, { onConflict: "task_id,completion_date" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("task_completions")
          .delete()
          .eq("task_id", params.task_id)
          .eq("completion_date", params.completion_date);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-completions"] });
      queryClient.invalidateQueries({ queryKey: ["player-goals"] });
    },
  });
}
