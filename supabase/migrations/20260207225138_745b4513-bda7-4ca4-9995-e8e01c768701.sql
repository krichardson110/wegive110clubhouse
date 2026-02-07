-- Add attachments column to schedule_events table
ALTER TABLE public.schedule_events 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for event attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-attachments', 'event-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to event-attachments bucket
CREATE POLICY "Authenticated users can upload event attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-attachments');

-- Allow anyone to view event attachments (they're public)
CREATE POLICY "Anyone can view event attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-attachments');

-- Allow coaches to delete their event attachments
CREATE POLICY "Coaches can delete event attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-attachments');