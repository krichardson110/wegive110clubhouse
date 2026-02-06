-- Create training_logs table for tracking player workout progress
CREATE TABLE public.training_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own training logs
CREATE POLICY "Users can view their own training logs"
ON public.training_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own training logs
CREATE POLICY "Users can create their own training logs"
ON public.training_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own training logs
CREATE POLICY "Users can update their own training logs"
ON public.training_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own training logs
CREATE POLICY "Users can delete their own training logs"
ON public.training_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Coaches can view training logs for their team members
CREATE POLICY "Coaches can view team member training logs"
ON public.training_logs
FOR SELECT
USING (
  team_id IS NOT NULL AND
  public.is_team_coach(team_id)
);

-- Create indexes for performance
CREATE INDEX idx_training_logs_user_id ON public.training_logs(user_id);
CREATE INDEX idx_training_logs_team_id ON public.training_logs(team_id);
CREATE INDEX idx_training_logs_logged_at ON public.training_logs(logged_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_training_logs_updated_at
BEFORE UPDATE ON public.training_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();