-- Create journeys table
CREATE TABLE public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'BookOpen',
  color_gradient TEXT DEFAULT 'from-primary/20 to-accent/20 border-primary/40',
  journey_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chapters table
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon_name TEXT DEFAULT 'BookOpen',
  color_gradient TEXT DEFAULT 'from-primary/20 to-accent/20 border-primary/40',
  key_takeaways JSONB DEFAULT '[]'::jsonb,
  readings JSONB DEFAULT '[]'::jsonb,
  exercises JSONB DEFAULT '[]'::jsonb,
  chapter_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_journeys_order ON public.journeys(journey_order);
CREATE INDEX idx_journeys_published ON public.journeys(published);
CREATE INDEX idx_chapters_journey ON public.chapters(journey_id);
CREATE INDEX idx_chapters_order ON public.chapters(chapter_order);
CREATE INDEX idx_chapters_published ON public.chapters(published);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_journeys_updated_at
  BEFORE UPDATE ON public.journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'krichardson@wegive110.com'
  )
$$;

-- RLS Policies for journeys
CREATE POLICY "Super admin can do all on journeys"
  ON public.journeys
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Authenticated users can view published journeys"
  ON public.journeys
  FOR SELECT
  TO authenticated
  USING (published = true);

-- RLS Policies for chapters
CREATE POLICY "Super admin can do all on chapters"
  ON public.chapters
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Authenticated users can view published chapters"
  ON public.chapters
  FOR SELECT
  TO authenticated
  USING (
    published = true 
    AND EXISTS (
      SELECT 1 FROM public.journeys j 
      WHERE j.id = journey_id 
      AND j.published = true
    )
  );

-- Allow anonymous users to view published content (for public viewing)
CREATE POLICY "Anyone can view published journeys"
  ON public.journeys
  FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Anyone can view published chapters"
  ON public.chapters
  FOR SELECT
  TO anon
  USING (
    published = true 
    AND EXISTS (
      SELECT 1 FROM public.journeys j 
      WHERE j.id = journey_id 
      AND j.published = true
    )
  );