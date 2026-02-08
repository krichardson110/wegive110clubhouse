import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import type { TeamInvitation } from "@/types/team";

export function useTeamInvitations(teamId: string | undefined, teamName?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ["team-invitations", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("team_id", teamId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as TeamInvitation[];
    },
    enabled: !!teamId,
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (invitation: {
      email: string;
      invite_type: 'player' | 'parent' | 'coach';
      player_name?: string;
      create_account?: boolean;
    }) => {
      if (!teamId || !user) throw new Error("Missing required data");
      
      // First create the invitation in the database
      const { data, error } = await supabase
        .from("team_invitations")
        .insert({
          team_id: teamId,
          email: invitation.email,
          invite_type: invitation.invite_type,
          player_name: invitation.player_name || null,
          invited_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Get the user's profile for the inviter name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const inviterName = profile?.display_name || user.email?.split('@')[0] || 'Your coach';

      // Now send the invitation email (and optionally create account)
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('send-team-invite', {
        body: {
          invitation_id: data.id,
          team_name: teamName || 'the team',
          inviter_name: inviterName,
          create_account: invitation.create_account || false,
        },
      });

      if (response.error) {
        console.error("Failed to send invitation email:", response.error);
        // Don't throw - the invitation was created, just the email failed
        toast({ 
          title: "Invitation created but email failed to send", 
          description: "You can share the invite link manually.",
          variant: "destructive" 
        });
      }

      return { ...data, accountCreated: invitation.create_account && !response.error };
    },
    onSuccess: (data) => {
      if (data?.accountCreated) {
        toast({ 
          title: "Invitation sent with Drive 5 account!", 
          description: "Login credentials were emailed to the invitee."
        });
      } else {
        toast({ title: "Invitation sent successfully!" });
      }
      queryClient.invalidateQueries({ queryKey: ["team-invitations", teamId] });
    },
    onError: (error: Error) => {
      console.error("Error creating invitation:", error);
      if (error.message?.includes("duplicate")) {
        toast({ 
          title: "This email has already been invited", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Failed to create invitation", 
          variant: "destructive" 
        });
      }
    },
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Invitation cancelled" });
      queryClient.invalidateQueries({ queryKey: ["team-invitations", teamId] });
    },
    onError: () => {
      toast({ title: "Failed to cancel invitation", variant: "destructive" });
    },
  });

  return {
    invitations: invitationsQuery.data || [],
    isLoading: invitationsQuery.isLoading,
    createInvitation: createInvitationMutation.mutate,
    deleteInvitation: deleteInvitationMutation.mutate,
    isCreating: createInvitationMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["team-invitations", teamId] }),
  };
}

export function useAcceptInvitation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!user) throw new Error("Must be logged in to accept invitation");
      
      // Find the invitation
      const { data: invitation, error: findError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("token", token)
        .is("accepted_at", null)
        .single();
      
      if (findError || !invitation) {
        throw new Error("Invalid or expired invitation");
      }
      
      // Check if already a member
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", invitation.team_id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existingMember) {
        throw new Error("You're already a member of this team");
      }
      
      // Add as team member
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.invite_type,
          player_name: invitation.player_name,
          status: "active",
          joined_at: new Date().toISOString(),
        });
      
      if (memberError) throw memberError;
      
      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);
      
      if (updateError) throw updateError;
      
      return invitation;
    },
    onSuccess: () => {
      toast({ title: "Successfully joined the team!" });
      queryClient.invalidateQueries({ queryKey: ["my-teams"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: error.message || "Failed to join team", 
        variant: "destructive" 
      });
    },
  });
}
