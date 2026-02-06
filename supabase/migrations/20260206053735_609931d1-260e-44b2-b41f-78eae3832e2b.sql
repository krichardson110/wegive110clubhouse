-- Create table for Return & Report settings (pinned meet link)
CREATE TABLE public.return_report_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_meet_url text,
  meet_title text DEFAULT 'Team Meeting',
  meet_description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create table for past recordings
CREATE TABLE public.return_report_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  youtube_id text,
  external_url text,
  recording_date date NOT NULL DEFAULT CURRENT_DATE,
  duration text,
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.return_report_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_report_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies for settings
CREATE POLICY "Anyone can view return report settings"
ON public.return_report_settings
FOR SELECT
USING (true);

CREATE POLICY "Super admin can manage return report settings"
ON public.return_report_settings
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- RLS policies for recordings
CREATE POLICY "Anyone can view published recordings"
ON public.return_report_recordings
FOR SELECT
USING (published = true);

CREATE POLICY "Super admin can manage recordings"
ON public.return_report_recordings
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Trigger for updated_at on recordings
CREATE TRIGGER update_return_report_recordings_updated_at
BEFORE UPDATE ON public.return_report_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings row
INSERT INTO public.return_report_settings (meet_title, meet_description)
VALUES ('Weekly Team Meeting', 'Join us for our regular team check-in and discussion.');