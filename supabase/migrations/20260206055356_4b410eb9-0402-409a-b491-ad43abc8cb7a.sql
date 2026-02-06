-- Create video categories table
CREATE TABLE public.video_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Video',
  color_gradient TEXT NOT NULL DEFAULT 'from-primary/20 to-accent/20 border-primary/40',
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table (different from wellness_videos - this is for all video content)
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.video_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  duration TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_categories
CREATE POLICY "Anyone can view published video categories"
  ON public.video_categories FOR SELECT
  USING (published = true);

CREATE POLICY "Super admin can manage video categories"
  ON public.video_categories FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- RLS policies for videos
CREATE POLICY "Anyone can view published videos"
  ON public.videos FOR SELECT
  USING (published = true AND EXISTS (
    SELECT 1 FROM video_categories vc
    WHERE vc.id = videos.category_id AND vc.published = true
  ));

CREATE POLICY "Super admin can manage videos"
  ON public.videos FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Add updated_at triggers
CREATE TRIGGER update_video_categories_updated_at
  BEFORE UPDATE ON public.video_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();