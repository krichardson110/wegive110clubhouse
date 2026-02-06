-- Create profiles table for user display info
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  posts_count integer NOT NULL DEFAULT 0,
  likes_given_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_name text NOT NULL DEFAULT 'Award',
  color_gradient text NOT NULL DEFAULT 'from-primary to-accent',
  badge_type text NOT NULL DEFAULT 'manual', -- 'automatic' or 'manual'
  auto_criteria jsonb, -- e.g., {"posts_count": 10} or {"likes_given_count": 50}
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at timestamp with time zone NOT NULL DEFAULT now(),
  awarded_by uuid REFERENCES auth.users(id), -- null for automatic badges
  UNIQUE(user_id, badge_id)
);

-- Create posts table
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  media_urls jsonb DEFAULT '[]'::jsonb,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Badges RLS policies
CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Super admin can manage badges"
ON public.badges FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- User badges RLS policies
CREATE POLICY "Anyone can view user badges"
ON public.user_badges FOR SELECT
USING (true);

CREATE POLICY "Super admin can manage user badges"
ON public.user_badges FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Posts RLS policies
CREATE POLICY "Anyone can view published posts"
ON public.posts FOR SELECT
USING (published = true);

CREATE POLICY "Users can create own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id OR is_super_admin());

-- Post likes RLS policies
CREATE POLICY "Anyone can view post likes"
ON public.post_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON public.post_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.post_likes FOR DELETE
USING (auth.uid() = user_id);

-- Post comments RLS policies
CREATE POLICY "Anyone can view comments"
ON public.post_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.post_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.post_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.post_comments FOR DELETE
USING (auth.uid() = user_id OR is_super_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    UPDATE profiles SET likes_given_count = likes_given_count + 1 WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    UPDATE profiles SET likes_given_count = likes_given_count - 1 WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Function to update post comments count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    UPDATE profiles SET comments_count = comments_count + 1 WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    UPDATE profiles SET comments_count = comments_count - 1 WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- Function to update profile posts count
CREATE OR REPLACE FUNCTION public.update_profile_posts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET posts_count = posts_count - 1 WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_profile_posts_count
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_profile_posts_count();

-- Insert default badges
INSERT INTO public.badges (name, description, icon_name, color_gradient, badge_type, auto_criteria, display_order) VALUES
('First Post', 'Made your first post in the community', 'MessageSquare', 'from-blue-500 to-cyan-500', 'automatic', '{"posts_count": 1}', 1),
('Storyteller', 'Shared 10 posts with the team', 'BookOpen', 'from-purple-500 to-pink-500', 'automatic', '{"posts_count": 10}', 2),
('Prolific Writer', 'Shared 50 posts with the team', 'PenTool', 'from-amber-500 to-orange-500', 'automatic', '{"posts_count": 50}', 3),
('Supporter', 'Gave 10 likes to teammates', 'Heart', 'from-red-500 to-pink-500', 'automatic', '{"likes_given_count": 10}', 4),
('Cheerleader', 'Gave 50 likes to teammates', 'Star', 'from-yellow-500 to-amber-500', 'automatic', '{"likes_given_count": 50}', 5),
('Conversationalist', 'Left 10 comments on posts', 'MessageCircle', 'from-green-500 to-emerald-500', 'automatic', '{"comments_count": 10}', 6),
('MVP', 'Recognized by coaches for outstanding contribution', 'Trophy', 'from-yellow-400 to-yellow-600', 'manual', NULL, 7),
('Iron Will', 'Demonstrated exceptional dedication and perseverance', 'Flame', 'from-orange-500 to-red-600', 'manual', NULL, 8),
('Team Player', 'Goes above and beyond to support teammates', 'Users', 'from-primary to-accent', 'manual', NULL, 9);

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);

-- Storage policies for post media
CREATE POLICY "Anyone can view post media"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own post media"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);