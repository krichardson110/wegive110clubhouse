import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Team } from "@/types/team";

export interface CoachTeam extends Team {
  memberCount: number;
}

export function useCoachTeams() {
  const { user } = useAuth();

  const coachTeamsQuery = useQuery({
    queryKey: ["coach-teams", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get teams where user is a coach
      const { data: coachMemberships, error: memberError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .eq("role", "coach")
        .eq("status", "active");
      
      if (memberError) throw memberError;
      
      if (!coachMemberships?.length) return [];
      
      const teamIds = coachMemberships.map(m => m.team_id);
      
      // Get team details
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .in("id", teamIds)
        .order("name", { ascending: true });
      
      if (teamsError) throw teamsError;

      // Get member counts for each team
      const { data: memberCounts, error: countError } = await supabase
        .from("team_members")
        .select("team_id")
        .in("team_id", teamIds)
        .eq("status", "active");

      if (countError) throw countError;

      // Count members per team
      const countMap = teamIds.reduce((acc, id) => {
        acc[id] = memberCounts?.filter(m => m.team_id === id).length || 0;
        return acc;
      }, {} as Record<string, number>);
      
      return teams?.map(team => ({
        ...team,
        memberCount: countMap[team.id] || 0
      })) as CoachTeam[];
    },
    enabled: !!user,
  });

  return {
    coachTeams: coachTeamsQuery.data || [],
    isLoading: coachTeamsQuery.isLoading,
    isCoach: (coachTeamsQuery.data?.length || 0) > 0,
  };
}
