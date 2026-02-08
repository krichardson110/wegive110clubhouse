-- Create a security definer function to lookup invitations by token
-- This allows the accept invitation flow to work without exposing the table
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(invite_token text)
RETURNS TABLE (
  id uuid,
  team_id uuid,
  invite_type text,
  player_name text,
  expires_at timestamptz,
  accepted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    team_id,
    invite_type,
    player_name,
    expires_at,
    accepted_at
  FROM team_invitations
  WHERE token = invite_token
    AND expires_at > now()
  LIMIT 1
$$;

-- Create a security definer function to mark invitation as accepted
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invite_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  new_member_id uuid;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM team_invitations
  WHERE token = invite_token
    AND accepted_at IS NULL
    AND expires_at > now();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = invitation_record.team_id
      AND user_id = auth.uid()
  ) THEN
    -- User is already a member - check if we should add another player
    SELECT id INTO new_member_id
    FROM team_members
    WHERE team_id = invitation_record.team_id
      AND user_id = auth.uid();
      
    -- Add player if player_name exists
    IF invitation_record.player_name IS NOT NULL AND 
       (invitation_record.invite_type = 'player' OR invitation_record.invite_type = 'parent') THEN
      INSERT INTO team_member_players (team_member_id, player_name)
      VALUES (new_member_id, invitation_record.player_name);
    ELSE
      RAISE EXCEPTION 'Already a member of this team';
    END IF;
  ELSE
    -- Add as new team member
    INSERT INTO team_members (team_id, user_id, role, player_name, status, joined_at)
    VALUES (
      invitation_record.team_id,
      auth.uid(),
      invitation_record.invite_type,
      invitation_record.player_name,
      'active',
      now()
    )
    RETURNING id INTO new_member_id;
    
    -- Also add to team_member_players if applicable
    IF invitation_record.player_name IS NOT NULL AND 
       (invitation_record.invite_type = 'player' OR invitation_record.invite_type = 'parent') THEN
      INSERT INTO team_member_players (team_member_id, player_name)
      VALUES (new_member_id, invitation_record.player_name);
    END IF;
  END IF;
  
  -- Mark invitation as accepted
  UPDATE team_invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;
  
  RETURN invitation_record.team_id;
END;
$$;