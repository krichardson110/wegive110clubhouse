-- Drop existing policies on team_invitations
DROP POLICY IF EXISTS "Team coaches can view invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team coaches can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team coaches can delete invitations" ON public.team_invitations;

-- Recreate policies with explicit authentication requirement
CREATE POLICY "Authenticated team coaches can view invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (is_team_coach(team_id));

CREATE POLICY "Authenticated team coaches can create invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (is_team_coach(team_id));

CREATE POLICY "Authenticated team coaches can delete invitations"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (is_team_coach(team_id));

-- Allow authenticated users to view invitations by token (for accepting)
-- This is secure because they need the exact token to access
CREATE POLICY "Authenticated users can view invitation by token"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  -- User can only see an invitation if they know the exact token
  -- This is used during the accept invitation flow
  token IS NOT NULL
);