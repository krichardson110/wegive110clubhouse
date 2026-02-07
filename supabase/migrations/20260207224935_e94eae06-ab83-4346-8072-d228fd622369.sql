-- Add team_id column to schedule_events for team-specific events
ALTER TABLE public.schedule_events 
ADD COLUMN team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

-- Create index for faster team-based queries
CREATE INDEX idx_schedule_events_team_id ON public.schedule_events(team_id);

-- Update RLS policy to allow team coaches to manage their team's events
CREATE POLICY "Team coaches can manage their team events" 
ON public.schedule_events 
FOR ALL 
USING (
  team_id IS NOT NULL AND is_team_coach(team_id)
)
WITH CHECK (
  team_id IS NOT NULL AND is_team_coach(team_id)
);