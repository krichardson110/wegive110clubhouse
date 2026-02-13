import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Profile } from "@/types/community";

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({ user_id: user.id, display_name: user.email?.split("@")[0] })
          .select()
          .single();
        
        if (createError) throw createError;
        return newProfile as Profile;
      }
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return { profile, isLoading, updateProfile };
};

export const useProfileById = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio, posts_count, comments_count, likes_given_count, created_at, updated_at, id")
        .eq("user_id", userId)
        .single();
      
      if (error) return null;
      return data as Profile;
    },
    enabled: !!userId,
  });
};
