
-- Create table for user exercise responses
CREATE TABLE public.exercise_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  response_text TEXT,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate responses for same exercise
ALTER TABLE public.exercise_responses 
ADD CONSTRAINT unique_user_exercise UNIQUE (user_id, chapter_id, exercise_id);

-- Enable RLS
ALTER TABLE public.exercise_responses ENABLE ROW LEVEL SECURITY;

-- Users can view their own responses
CREATE POLICY "Users can view own exercise responses"
ON public.exercise_responses FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own responses
CREATE POLICY "Users can create own exercise responses"
ON public.exercise_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update own exercise responses"
ON public.exercise_responses FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own responses
CREATE POLICY "Users can delete own exercise responses"
ON public.exercise_responses FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_exercise_responses_updated_at
BEFORE UPDATE ON public.exercise_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
