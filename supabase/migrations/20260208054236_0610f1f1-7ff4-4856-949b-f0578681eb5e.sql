-- Create a new table to store player profiles managed by a parent/guardian account
-- This allows one account to manage multiple players on the same team
CREATE TABLE public.team_member_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_number TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_member_players ENABLE ROW LEVEL SECURITY;

-- Create function to get team_id from team_member_id
CREATE OR REPLACE FUNCTION public.get_team_id_from_member(member_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM team_members WHERE id = member_id
$$;

-- RLS policies
CREATE POLICY "Team members can view players on their team"
ON public.team_member_players
FOR SELECT
USING (
  is_team_member(get_team_id_from_member(team_member_id))
);

CREATE POLICY "Account holders can manage their own players"
ON public.team_member_players
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.id = team_member_players.team_member_id
    AND team_members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.id = team_member_players.team_member_id
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team coaches can manage all players"
ON public.team_member_players
FOR ALL
USING (
  is_team_coach(get_team_id_from_member(team_member_id))
)
WITH CHECK (
  is_team_coach(get_team_id_from_member(team_member_id))
);

-- Trigger for updated_at
CREATE TRIGGER update_team_member_players_updated_at
BEFORE UPDATE ON public.team_member_players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();