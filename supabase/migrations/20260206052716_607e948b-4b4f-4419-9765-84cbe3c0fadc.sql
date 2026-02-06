-- Create schedule_events table
CREATE TABLE public.schedule_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  end_time TEXT,
  event_type TEXT NOT NULL DEFAULT 'practice',
  location TEXT,
  opponent TEXT,
  notes TEXT,
  is_home BOOLEAN,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published schedule events" 
ON public.schedule_events 
FOR SELECT 
USING (published = true);

CREATE POLICY "Super admin can manage schedule events" 
ON public.schedule_events 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schedule_events_updated_at
BEFORE UPDATE ON public.schedule_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();