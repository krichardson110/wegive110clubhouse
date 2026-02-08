import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ExerciseResponse {
  id: string;
  user_id: string;
  chapter_id: string;
  exercise_id: string;
  response_text: string | null;
  time_spent_seconds: number | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export const useExerciseResponses = (chapterId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exercise-responses", chapterId, user?.id],
    queryFn: async (): Promise<ExerciseResponse[]> => {
      if (!user) return [];
      
      let query = supabase
        .from("exercise_responses")
        .select("*")
        .eq("user_id", user.id);
      
      if (chapterId) {
        query = query.eq("chapter_id", chapterId);
      }
      
      const { data, error } = await query.order("completed_at", { ascending: false });
      
      if (error) throw error;
      return data as ExerciseResponse[];
    },
    enabled: !!user,
  });
};

export const useSaveExerciseResponse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      chapterId,
      exerciseId,
      responseText,
      timeSpentSeconds,
    }: {
      chapterId: string;
      exerciseId: string;
      responseText?: string;
      timeSpentSeconds?: number;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("exercise_responses")
        .upsert(
          {
            user_id: user.id,
            chapter_id: chapterId,
            exercise_id: exerciseId,
            response_text: responseText || null,
            time_spent_seconds: timeSpentSeconds || null,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,chapter_id,exercise_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exercise-responses"] });
    },
  });
};

export const useDeleteExerciseResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (responseId: string) => {
      const { error } = await supabase
        .from("exercise_responses")
        .delete()
        .eq("id", responseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-responses"] });
    },
  });
};
