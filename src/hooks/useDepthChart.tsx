import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DepthChartEntry {
  id: string;
  team_id: string;
  position: string;
  depth_order: number;
  player_name: string;
  player_number: string | null;
  team_member_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const BASEBALL_POSITIONS = [
  { key: "P", label: "Pitcher" },
  { key: "C", label: "Catcher" },
  { key: "1B", label: "First Base" },
  { key: "2B", label: "Second Base" },
  { key: "3B", label: "Third Base" },
  { key: "SS", label: "Shortstop" },
  { key: "LF", label: "Left Field" },
  { key: "CF", label: "Center Field" },
  { key: "RF", label: "Right Field" },
  { key: "DH", label: "Designated Hitter" },
  { key: "EH", label: "Extra Hitter" },
] as const;

export const useDepthChart = (teamId?: string) => {
  return useQuery({
    queryKey: ["depth-chart", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await supabase
        .from("depth_chart")
        .select("*")
        .eq("team_id", teamId)
        .order("position")
        .order("depth_order");
      if (error) throw error;
      return data as DepthChartEntry[];
    },
    enabled: !!teamId,
  });
};

export const useUpsertDepthChart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      id?: string;
      team_id: string;
      position: string;
      depth_order: number;
      player_name: string;
      team_member_id?: string | null;
      notes?: string | null;
    }) => {
      if (entry.id) {
        const { error } = await supabase
          .from("depth_chart")
          .update({
            player_name: entry.player_name,
            team_member_id: entry.team_member_id || null,
            notes: entry.notes || null,
          })
          .eq("id", entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("depth_chart").insert({
          team_id: entry.team_id,
          position: entry.position,
          depth_order: entry.depth_order,
          player_name: entry.player_name,
          team_member_id: entry.team_member_id || null,
          notes: entry.notes || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depth-chart"] });
      toast.success("Depth chart updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update depth chart");
    },
  });
};

export const useDeleteDepthChartEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("depth_chart").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depth-chart"] });
      toast.success("Player removed from depth chart");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove player");
    },
  });
};
