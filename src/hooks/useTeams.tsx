import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import type { Team, TeamMember } from "@/types/team";

export function useTeams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ["my-teams", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get teams where user is a member
      const { data: memberTeams, error: memberError } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (memberError) throw memberError;
      
      if (!memberTeams?.length) return [];
      
      const teamIds = memberTeams.map(m => m.team_id);
      
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .in("id", teamIds);
      
      if (teamsError) throw teamsError;
      
      // Attach user's role to each team
      return teams?.map(team => ({
        ...team,
        userRole: memberTeams.find(m => m.team_id === team.id)?.role
      })) || [];
    },
    enabled: !!user,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: Partial<Team>) => {
      if (!user) throw new Error("Must be logged in");
      
      // Create the team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamData.name,
          description: teamData.description,
          age_group: teamData.age_group,
          season: teamData.season,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (teamError) throw teamError;
      
      // Add creator as coach
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "coach",
          status: "active",
          joined_at: new Date().toISOString(),
        });
      
      if (memberError) throw memberError;
      
      return team;
    },
    onSuccess: () => {
      toast({ title: "Team created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["my-teams"] });
    },
    onError: (error) => {
      console.error("Error creating team:", error);
      toast({ 
        title: "Failed to create team", 
        variant: "destructive" 
      });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from("teams")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Team updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["my-teams"] });
    },
    onError: (error) => {
      console.error("Error updating team:", error);
      toast({ 
        title: "Failed to update team", 
        variant: "destructive" 
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Team deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["my-teams"] });
    },
    onError: (error) => {
      console.error("Error deleting team:", error);
      toast({ 
        title: "Failed to delete team", 
        variant: "destructive" 
      });
    },
  });

  return {
    teams: teamsQuery.data || [],
    isLoading: teamsQuery.isLoading,
    createTeam: createTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
    isCreating: createTeamMutation.isPending,
  };
}

export function useTeam(teamId: string | undefined) {
  const { user } = useAuth();

  const teamQuery = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      
      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamId && !!user,
  });

  const membershipQuery = useQuery({
    queryKey: ["team-membership", teamId, user?.id],
    queryFn: async () => {
      if (!teamId || !user) return null;
      
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      
      if (error) throw error;
      return data as TeamMember | null;
    },
    enabled: !!teamId && !!user,
  });

  return {
    team: teamQuery.data,
    membership: membershipQuery.data,
    isLoading: teamQuery.isLoading || membershipQuery.isLoading,
    isCoach: membershipQuery.data?.role === "coach",
    isMember: !!membershipQuery.data,
  };
}

export function useTeamMembers(teamId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      // Get team members
      const { data: members, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .order("role", { ascending: true })
        .order("player_name", { ascending: true });
      
      if (error) throw error;
      
      // Get profiles for all member user_ids
      const userIds = members?.map(m => m.user_id) || [];
      if (userIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      
      // Merge profiles with members
      return members?.map(member => ({
        ...member,
        role: member.role as 'coach' | 'player' | 'parent',
        status: member.status as 'pending' | 'active' | 'inactive',
        profile: profiles?.find(p => p.user_id === member.user_id) || null,
      })) as TeamMember[];
    },
    enabled: !!teamId,
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Member removed" });
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
    onError: () => {
      toast({ title: "Failed to remove member", variant: "destructive" });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeamMember> & { id: string }) => {
      const { error } = await supabase
        .from("team_members")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Member updated" });
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
    onError: () => {
      toast({ title: "Failed to update member", variant: "destructive" });
    },
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    removeMember: removeMemberMutation.mutate,
    updateMember: updateMemberMutation.mutate,
    coaches: membersQuery.data?.filter(m => m.role === "coach") || [],
    players: membersQuery.data?.filter(m => m.role === "player") || [],
    parents: membersQuery.data?.filter(m => m.role === "parent") || [],
  };
}
