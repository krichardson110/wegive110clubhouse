import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useWorkoutFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["workout-favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("workout_favorites")
        .select("workout_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map(f => f.workout_id);
    },
    enabled: !!user?.id,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (workoutId: string) => {
      if (!user?.id) throw new Error("Must be logged in");
      
      const isFavorited = favorites.includes(workoutId);
      
      if (isFavorited) {
        const { error } = await supabase
          .from("workout_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("workout_id", workoutId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("workout_favorites")
          .insert({ user_id: user.id, workout_id: workoutId });
        if (error) throw error;
      }
      
      return !isFavorited;
    },
    onSuccess: (isNowFavorited) => {
      queryClient.invalidateQueries({ queryKey: ["workout-favorites"] });
      toast.success(isNowFavorited ? "Workout starred!" : "Workout unstarred");
    },
    onError: () => {
      toast.error("Failed to update favorite");
    },
  });

  const isFavorite = (workoutId: string) => favorites.includes(workoutId);

  return {
    favorites,
    isLoading,
    toggleFavorite: toggleFavorite.mutate,
    isFavorite,
    isToggling: toggleFavorite.isPending,
  };
};
