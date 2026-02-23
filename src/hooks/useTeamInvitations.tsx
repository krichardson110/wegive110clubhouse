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
      
      // Get pending invitations (not accepted)
      const { data: pending, error: pendingError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("team_id", teamId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      
      if (pendingError) throw pendingError;

      // Get recently accepted invitations (within last 7 days) to show "Accepted" status
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: accepted, error: acceptedError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("team_id", teamId)
        .not("accepted_at", "is", null)
        .gte("accepted_at", sevenDaysAgo.toISOString())
        .order("accepted_at", { ascending: false });
      
      if (acceptedError) throw acceptedError;

      // Combine both lists - pending first, then accepted
      return [...(pending || []), ...(accepted || [])] as TeamInvitation[];
    },
    enabled: !!teamId,
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (invitation: {
      email: string;
      invite_type: 'player' | 'parent' | 'coach';
      player_name?: string;
    }) => {
      if (!teamId || !user) throw new Error("Missing required data");
      
      // Delete any existing invitations for this email on this team (including accepted ones)
      await supabase
        .from("team_invitations")
        .delete()
        .eq("team_id", teamId)
        .eq("email", invitation.email);
      
      // Create the new invitation
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

      // Send the invitation email and auto-create account
      const response = await supabase.functions.invoke('send-team-invite', {
        body: {
          invitation_id: data.id,
          team_name: teamName || 'the team',
          inviter_name: inviterName,
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
        return { ...data, accountCreated: false, userAlreadyExisted: false };
      }

      // Extract response data from the edge function
      const responseData = response.data || {};
      
      return { 
        ...data, 
        accountCreated: responseData.accountCreated || false,
        userAlreadyExisted: responseData.userAlreadyExisted || false,
      };
    },
    onSuccess: (data) => {
      if (data?.accountCreated) {
        toast({ 
          title: "Invitation sent!", 
          description: "Account credentials were emailed to the invitee."
        });
      } else if (data?.userAlreadyExisted) {
        toast({ 
          title: "Invitation sent!", 
          description: "This person already has an account - they can use their existing credentials."
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

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitation: TeamInvitation) => {
      if (!user) throw new Error("Must be logged in");

      // Get the user's profile for the inviter name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const inviterName = profile?.display_name || user.email?.split('@')[0] || 'Your coach';

      // Resend the invitation email
      const response = await supabase.functions.invoke('send-team-invite', {
        body: {
          invitation_id: invitation.id,
          team_name: teamName || 'the team',
          inviter_name: inviterName,
          create_account: false, // Don't create account on resend
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to resend email');
      }

      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Invitation email resent!" });
    },
    onError: (error: Error) => {
      console.error("Error resending invitation:", error);
      toast({ 
        title: "Failed to resend invitation", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return {
    invitations: invitationsQuery.data || [],
    isLoading: invitationsQuery.isLoading,
    createInvitation: createInvitationMutation.mutate,
    deleteInvitation: deleteInvitationMutation.mutate,
    resendInvitation: resendInvitationMutation.mutate,
    isCreating: createInvitationMutation.isPending,
    isResending: resendInvitationMutation.isPending,
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
      
      // Use the secure RPC function to accept the invitation
      // This avoids exposing the team_invitations table directly
      const { data: teamId, error } = await supabase.rpc('accept_team_invitation', {
        invite_token: token
      });
      
      if (error) {
        if (error.message.includes('Invalid or expired')) {
          throw new Error("Invalid or expired invitation");
        }
        if (error.message.includes('Already a member')) {
          throw new Error("You're already a member of this team");
        }
        throw error;
      }
      
      return { team_id: teamId };
    },
    onSuccess: () => {
      toast({ title: "Successfully joined the team!" });
      queryClient.invalidateQueries({ queryKey: ["my-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: error.message || "Failed to join team", 
        variant: "destructive" 
      });
    },
  });
}
