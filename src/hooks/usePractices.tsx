import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Practice, PracticeDrill, PracticeSeason, PracticePhase } from "@/types/practice";

export function usePractices(teamId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const practicesQuery = useQuery({
    queryKey: ["practices", teamId],
    queryFn: async () => {
      let query = supabase
        .from("practices")
        .select("*")
        .eq("published", true)
        .order("practice_date", { ascending: true });

      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map the data to correct types
      return (data || []).map(row => ({
        ...row,
        season: row.season as PracticeSeason,
        phase: row.phase as PracticePhase,
      })) as Practice[];
    },
  });

  const drillsQuery = useQuery({
    queryKey: ["practice-drills", teamId],
    queryFn: async () => {
      const practiceIds = practicesQuery.data?.map(p => p.id) || [];
      if (practiceIds.length === 0) return [];

      const { data, error } = await supabase
        .from("practice_drills")
        .select("*")
        .in("practice_id", practiceIds)
        .order("drill_order", { ascending: true });

      if (error) throw error;
      return (data || []) as PracticeDrill[];
    },
    enabled: !!practicesQuery.data && practicesQuery.data.length > 0,
  });

  const createPracticeMutation = useMutation({
    mutationFn: async (practiceData: Omit<Practice, "id" | "created_at" | "updated_at" | "drills">) => {
      const { data, error } = await supabase
        .from("practices")
        .insert(practiceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Practice created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
    onError: (error) => {
      console.error("Error creating practice:", error);
      toast({ title: "Failed to create practice", variant: "destructive" });
    },
  });

  const updatePracticeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Practice> & { id: string }) => {
      const { drills, ...practiceUpdates } = updates;
      const { data, error } = await supabase
        .from("practices")
        .update(practiceUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Practice updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
    onError: (error) => {
      console.error("Error updating practice:", error);
      toast({ title: "Failed to update practice", variant: "destructive" });
    },
  });

  const deletePracticeMutation = useMutation({
    mutationFn: async (practiceId: string) => {
      const { error } = await supabase
        .from("practices")
        .delete()
        .eq("id", practiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Practice deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
    onError: (error) => {
      console.error("Error deleting practice:", error);
      toast({ title: "Failed to delete practice", variant: "destructive" });
    },
  });

  // Drill mutations
  const createDrillMutation = useMutation({
    mutationFn: async (drillData: Omit<PracticeDrill, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("practice_drills")
        .insert(drillData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Drill added successfully!" });
      queryClient.invalidateQueries({ queryKey: ["practice-drills"] });
    },
    onError: (error) => {
      console.error("Error creating drill:", error);
      toast({ title: "Failed to add drill", variant: "destructive" });
    },
  });

  const updateDrillMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PracticeDrill> & { id: string }) => {
      const { data, error } = await supabase
        .from("practice_drills")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Drill updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["practice-drills"] });
    },
    onError: (error) => {
      console.error("Error updating drill:", error);
      toast({ title: "Failed to update drill", variant: "destructive" });
    },
  });

  const deleteDrillMutation = useMutation({
    mutationFn: async (drillId: string) => {
      const { error } = await supabase
        .from("practice_drills")
        .delete()
        .eq("id", drillId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Drill deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["practice-drills"] });
    },
    onError: (error) => {
      console.error("Error deleting drill:", error);
      toast({ title: "Failed to delete drill", variant: "destructive" });
    },
  });

  // Combine practices with their drills
  const practicesWithDrills = practicesQuery.data?.map(practice => ({
    ...practice,
    drills: drillsQuery.data?.filter(d => d.practice_id === practice.id) || [],
  })) || [];

  // Get upcoming practices (next 30 days)
  const getUpcomingPractices = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    return practicesWithDrills.filter(practice => {
      const practiceDate = new Date(practice.practice_date + "T00:00:00");
      return practiceDate >= today && practiceDate <= thirtyDaysLater;
    });
  };

  return {
    practices: practicesWithDrills,
    upcomingPractices: getUpcomingPractices(),
    isLoading: practicesQuery.isLoading,
    createPractice: createPracticeMutation.mutate,
    updatePractice: updatePracticeMutation.mutate,
    deletePractice: deletePracticeMutation.mutate,
    createDrill: createDrillMutation.mutate,
    updateDrill: updateDrillMutation.mutate,
    deleteDrill: deleteDrillMutation.mutate,
    isCreating: createPracticeMutation.isPending,
    isUpdating: updatePracticeMutation.isPending,
    isDeleting: deletePracticeMutation.isPending,
  };
}
