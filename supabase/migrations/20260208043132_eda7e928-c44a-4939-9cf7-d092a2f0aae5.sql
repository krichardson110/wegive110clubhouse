-- Create video_watch_sessions table to track workout video watch time
CREATE TABLE public.video_watch_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_watch_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own watch sessions
CREATE POLICY "Users can view their own watch sessions"
ON public.video_watch_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own watch sessions
CREATE POLICY "Users can insert their own watch sessions"
ON public.video_watch_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own watch sessions
CREATE POLICY "Users can update their own watch sessions"
ON public.video_watch_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Super admin can view all watch sessions
CREATE POLICY "Super admin can view all watch sessions"
ON public.video_watch_sessions
FOR SELECT
USING (is_super_admin());

-- Add indexes for faster lookups
CREATE INDEX idx_video_watch_sessions_user ON public.video_watch_sessions(user_id);
CREATE INDEX idx_video_watch_sessions_workout ON public.video_watch_sessions(workout_id);
CREATE INDEX idx_video_watch_sessions_started ON public.video_watch_sessions(started_at DESC);