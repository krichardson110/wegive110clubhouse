-- Drop and recreate the accept_team_invitation function with better handling
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invite_token text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  existing_member RECORD;
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
  SELECT * INTO existing_member
  FROM team_members
  WHERE team_id = invitation_record.team_id
    AND user_id = auth.uid();
    
  IF FOUND THEN
    -- User is already a member
    IF invitation_record.invite_type = 'player' THEN
      -- If they're already a member and being invited as player, 
      -- just add the player info if provided
      IF invitation_record.player_name IS NOT NULL THEN
        INSERT INTO team_member_players (team_member_id, player_name)
        VALUES (existing_member.id, invitation_record.player_name);
        
        -- Mark invitation as accepted
        UPDATE team_invitations
        SET accepted_at = now()
        WHERE id = invitation_record.id;
        
        RETURN invitation_record.team_id;
      ELSE
        -- No player name, check if they're already a player
        IF existing_member.role = 'player' THEN
          RAISE EXCEPTION 'You are already a player on this team';
        ELSE
          -- They're a coach/parent being invited as player without a name
          -- Just mark as accepted since they're already on the team
          UPDATE team_invitations
          SET accepted_at = now()
          WHERE id = invitation_record.id;
          
          RETURN invitation_record.team_id;
        END IF;
      END IF;
    ELSIF invitation_record.invite_type = 'parent' THEN
      -- Parent invitation - add player if name provided
      IF invitation_record.player_name IS NOT NULL THEN
        INSERT INTO team_member_players (team_member_id, player_name)
        VALUES (existing_member.id, invitation_record.player_name);
      END IF;
      
      -- Mark invitation as accepted
      UPDATE team_invitations
      SET accepted_at = now()
      WHERE id = invitation_record.id;
      
      RETURN invitation_record.team_id;
    ELSIF invitation_record.invite_type = 'coach' THEN
      -- Coach invitation - check if already a coach
      IF existing_member.role = 'coach' THEN
        RAISE EXCEPTION 'You are already a coach on this team';
      ELSE
        -- Upgrade to coach role
        UPDATE team_members
        SET role = 'coach'
        WHERE id = existing_member.id;
        
        -- Mark invitation as accepted
        UPDATE team_invitations
        SET accepted_at = now()
        WHERE id = invitation_record.id;
        
        RETURN invitation_record.team_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'You are already a member of this team';
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
$function$;