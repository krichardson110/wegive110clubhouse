
-- Remove the overly broad coach access policy on exercise_responses
DROP POLICY IF EXISTS "Coaches can view team member exercise responses" ON public.exercise_responses;
