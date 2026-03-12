import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BattingLineupEntry {
  id: string;
  team_id: string;
  batting_order: number;
  player_name: string;
  position: string;
  team_member_id: string | null;
  is_substitute: boolean;
  substitutes_for: number | null;
  inning_enter: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBattingLineup = (teamId?: string) => {
  return useQuery({
    queryKey: ["batting-lineup", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await supabase
        .from("batting_lineups")
        .select("*")
        .eq("team_id", teamId)
        .order("is_substitute", { ascending: true })
        .order("batting_order", { ascending: true });
      if (error) throw error;
      return data as BattingLineupEntry[];
    },
    enabled: !!teamId,
  });
};

export const useUpsertBattingLineup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      id?: string;
      team_id: string;
      batting_order: number;
      player_name: string;
      position: string;
      team_member_id?: string | null;
      is_substitute?: boolean;
      substitutes_for?: number | null;
      inning_enter?: number | null;
      notes?: string | null;
    }) => {
      if (entry.id) {
        const { error } = await supabase
          .from("batting_lineups")
          .update({
            batting_order: entry.batting_order,
            player_name: entry.player_name,
            position: entry.position,
            team_member_id: entry.team_member_id || null,
            is_substitute: entry.is_substitute ?? false,
            substitutes_for: entry.substitutes_for ?? null,
            inning_enter: entry.inning_enter ?? null,
            notes: entry.notes || null,
          })
          .eq("id", entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("batting_lineups").insert({
          team_id: entry.team_id,
          batting_order: entry.batting_order,
          player_name: entry.player_name,
          position: entry.position,
          team_member_id: entry.team_member_id || null,
          is_substitute: entry.is_substitute ?? false,
          substitutes_for: entry.substitutes_for ?? null,
          inning_enter: entry.inning_enter ?? null,
          notes: entry.notes || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batting-lineup"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update lineup");
    },
  });
};

export const useDeleteBattingLineup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("batting_lineups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batting-lineup"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove from lineup");
    },
  });
};

export const useSwapBattingOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryA, entryB }: { entryA: { id: string; batting_order: number }; entryB: { id: string; batting_order: number } }) => {
      const { error: err1 } = await supabase
        .from("batting_lineups")
        .update({ batting_order: entryB.batting_order })
        .eq("id", entryA.id);
      if (err1) throw err1;
      const { error: err2 } = await supabase
        .from("batting_lineups")
        .update({ batting_order: entryA.batting_order })
        .eq("id", entryB.id);
      if (err2) throw err2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batting-lineup"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reorder lineup");
    },
  });
};

export const useClearBattingLineup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase.from("batting_lineups").delete().eq("team_id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batting-lineup"] });
      toast.success("Lineup cleared");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to clear lineup");
    },
  });
};
