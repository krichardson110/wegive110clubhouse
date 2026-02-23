
-- Add practice_id column to schedule_events to link practice plans to events
ALTER TABLE public.schedule_events
ADD COLUMN practice_id uuid REFERENCES public.practices(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_schedule_events_practice_id ON public.schedule_events(practice_id);
