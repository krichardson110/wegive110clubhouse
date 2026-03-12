CREATE TABLE public.batting_lineups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  batting_order integer NOT NULL,
  player_name text NOT NULL,
  position text NOT NULL,
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  is_substitute boolean NOT NULL DEFAULT false,
  substitutes_for integer NULL,
  inning_enter integer NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.batting_lineups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team coaches can manage batting lineups"
  ON public.batting_lineups FOR ALL
  TO public
  USING (is_team_coach(team_id))
  WITH CHECK (is_team_coach(team_id));

CREATE POLICY "Team members can view batting lineups"
  ON public.batting_lineups FOR SELECT
  TO public
  USING (is_team_member(team_id));