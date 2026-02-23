
-- Create depth chart table for baseball teams
CREATE TABLE public.depth_chart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  position text NOT NULL,
  depth_order integer NOT NULL DEFAULT 1,
  player_name text NOT NULL,
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, position, depth_order)
);

-- Enable RLS
ALTER TABLE public.depth_chart ENABLE ROW LEVEL SECURITY;

-- Coaches can manage depth chart
CREATE POLICY "Team coaches can manage depth chart"
  ON public.depth_chart FOR ALL
  USING (is_team_coach(team_id))
  WITH CHECK (is_team_coach(team_id));

-- Team members can view depth chart
CREATE POLICY "Team members can view depth chart"
  ON public.depth_chart FOR SELECT
  USING (is_team_member(team_id));

-- Trigger for updated_at
CREATE TRIGGER update_depth_chart_updated_at
  BEFORE UPDATE ON public.depth_chart
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
