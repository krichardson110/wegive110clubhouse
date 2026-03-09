
-- Add missing SELECT policy so users can read their own activity logs
-- This is critical: without it, .insert().select() fails and tracking breaks
CREATE POLICY "Users can view own activity logs"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
