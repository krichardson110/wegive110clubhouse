-- Allow coaches to view their team members' video watch sessions
CREATE POLICY "Coaches can view team member watch sessions"
ON public.video_watch_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = video_watch_sessions.user_id
    AND tm.status = 'active'
    AND is_team_coach(tm.team_id)
  )
);

-- Allow coaches to view their team members' exercise responses
CREATE POLICY "Coaches can view team member exercise responses"
ON public.exercise_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = exercise_responses.user_id
    AND tm.status = 'active'
    AND is_team_coach(tm.team_id)
  )
);

-- Allow coaches to view their team members' activity logs
CREATE POLICY "Coaches can view team member activity logs"
ON public.user_activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = user_activity_logs.user_id
    AND tm.status = 'active'
    AND is_team_coach(tm.team_id)
  )
);