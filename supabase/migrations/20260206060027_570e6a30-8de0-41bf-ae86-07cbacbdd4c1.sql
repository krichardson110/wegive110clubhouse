-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  age_group TEXT,
  season TEXT,
  logo_url TEXT,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table (coaches, players, parents)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('coach', 'player', 'parent')),
  player_name TEXT,
  player_number TEXT,
  position TEXT,
  parent_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invite_type TEXT NOT NULL DEFAULT 'player' CHECK (invite_type IN ('player', 'parent', 'coach')),
  player_name TEXT,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Create team_posts table (team-specific community)
CREATE TABLE public.team_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_post_comments table
CREATE TABLE public.team_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.team_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_post_likes table
CREATE TABLE public.team_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.team_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create team_events table (team-specific schedule)
CREATE TABLE public.team_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'practice' CHECK (event_type IN ('practice', 'game', 'tournament', 'meeting', 'other')),
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT,
  opponent TEXT,
  is_home BOOLEAN,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND status = 'active'
  )
$$;

-- Helper function to check if user is team coach
CREATE OR REPLACE FUNCTION public.is_team_coach(team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND role = 'coach'
    AND status = 'active'
  )
$$;

-- RLS Policies for teams
CREATE POLICY "Team members can view their teams"
  ON public.teams FOR SELECT
  USING (is_team_member(id) OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team coaches can update their teams"
  ON public.teams FOR UPDATE
  USING (is_team_coach(id));

CREATE POLICY "Team coaches can delete their teams"
  ON public.teams FOR DELETE
  USING (is_team_coach(id));

-- RLS Policies for team_members
CREATE POLICY "Team members can view roster"
  ON public.team_members FOR SELECT
  USING (is_team_member(team_id));

CREATE POLICY "Team coaches can add members"
  ON public.team_members FOR INSERT
  WITH CHECK (is_team_coach(team_id) OR user_id = auth.uid());

CREATE POLICY "Team coaches can update members"
  ON public.team_members FOR UPDATE
  USING (is_team_coach(team_id) OR user_id = auth.uid());

CREATE POLICY "Team coaches can remove members"
  ON public.team_members FOR DELETE
  USING (is_team_coach(team_id));

-- RLS Policies for team_invitations
CREATE POLICY "Team coaches can view invitations"
  ON public.team_invitations FOR SELECT
  USING (is_team_coach(team_id));

CREATE POLICY "Team coaches can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (is_team_coach(team_id));

CREATE POLICY "Team coaches can delete invitations"
  ON public.team_invitations FOR DELETE
  USING (is_team_coach(team_id));

-- RLS Policies for team_posts
CREATE POLICY "Team members can view posts"
  ON public.team_posts FOR SELECT
  USING (is_team_member(team_id) AND published = true);

CREATE POLICY "Team members can create posts"
  ON public.team_posts FOR INSERT
  WITH CHECK (is_team_member(team_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.team_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts or coaches can delete"
  ON public.team_posts FOR DELETE
  USING (auth.uid() = user_id OR is_team_coach(team_id));

-- RLS Policies for team_post_comments
CREATE POLICY "Team members can view comments"
  ON public.team_post_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM team_posts tp WHERE tp.id = post_id AND is_team_member(tp.team_id)));

CREATE POLICY "Team members can create comments"
  ON public.team_post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM team_posts tp WHERE tp.id = post_id AND is_team_member(tp.team_id))
  );

CREATE POLICY "Users can delete own comments"
  ON public.team_post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for team_post_likes
CREATE POLICY "Team members can view likes"
  ON public.team_post_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM team_posts tp WHERE tp.id = post_id AND is_team_member(tp.team_id)));

CREATE POLICY "Team members can like posts"
  ON public.team_post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM team_posts tp WHERE tp.id = post_id AND is_team_member(tp.team_id))
  );

CREATE POLICY "Users can unlike posts"
  ON public.team_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for team_events
CREATE POLICY "Team members can view events"
  ON public.team_events FOR SELECT
  USING (is_team_member(team_id));

CREATE POLICY "Team coaches can create events"
  ON public.team_events FOR INSERT
  WITH CHECK (is_team_coach(team_id));

CREATE POLICY "Team coaches can update events"
  ON public.team_events FOR UPDATE
  USING (is_team_coach(team_id));

CREATE POLICY "Team coaches can delete events"
  ON public.team_events FOR DELETE
  USING (is_team_coach(team_id));

-- Add updated_at triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_posts_updated_at
  BEFORE UPDATE ON public.team_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_post_comments_updated_at
  BEFORE UPDATE ON public.team_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_events_updated_at
  BEFORE UPDATE ON public.team_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for post like/comment counts
CREATE OR REPLACE FUNCTION public.update_team_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE team_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE team_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_team_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.team_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_post_likes_count();

CREATE OR REPLACE FUNCTION public.update_team_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE team_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE team_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_team_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.team_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_post_comments_count();