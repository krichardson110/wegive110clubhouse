-- Create user activity logs table
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  time_spent_seconds INTEGER DEFAULT 0,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activity
CREATE POLICY "Users can insert own activity"
ON public.user_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity (for time_spent updates)
CREATE POLICY "Users can update own activity"
ON public.user_activity_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Super admin can view all activity
CREATE POLICY "Super admin can view all activity"
ON public.user_activity_logs
FOR SELECT
USING (is_super_admin());

-- Create index for faster lookups
CREATE INDEX idx_user_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_visited_at ON public.user_activity_logs(visited_at DESC);