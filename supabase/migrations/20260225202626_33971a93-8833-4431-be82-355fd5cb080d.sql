
-- Revive 5 Categories
CREATE TABLE public.revive5_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '🙏',
  color_gradient text NOT NULL DEFAULT 'from-primary/20 to-accent/20',
  display_order integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.revive5_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view revive5 categories" ON public.revive5_categories FOR SELECT USING (true);
CREATE POLICY "Super admin can manage revive5 categories" ON public.revive5_categories FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Seed categories
INSERT INTO public.revive5_categories (name, icon, color_gradient, display_order, description) VALUES
  ('Routines', '🔄', 'from-blue-500/20 to-cyan-500/20', 0, 'Body, Being, Balance, Business'),
  ('Revelations', '✨', 'from-amber-500/20 to-yellow-500/20', 1, 'Connection with God and Prayer'),
  ('Relationships', '❤️', 'from-rose-500/20 to-pink-500/20', 2, 'Acts of kindness and love notes'),
  ('Reflections', '🧘', 'from-purple-500/20 to-indigo-500/20', 3, 'Meditation and Visual Affirmations'),
  ('Return & Report', '📊', 'from-emerald-500/20 to-green-500/20', 4, 'Tracking your progress and pivoting');

-- Revive 5 Daily Checkins
CREATE TABLE public.revive5_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  team_id uuid REFERENCES public.teams(id),
  category_id uuid NOT NULL REFERENCES public.revive5_categories(id),
  goal_id uuid,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT false,
  notes text,
  duration_minutes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, checkin_date)
);

ALTER TABLE public.revive5_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revive5 checkins" ON public.revive5_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own revive5 checkins" ON public.revive5_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revive5 checkins" ON public.revive5_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revive5 checkins" ON public.revive5_checkins FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Coaches can view team revive5 checkins" ON public.revive5_checkins FOR SELECT USING (team_id IS NOT NULL AND is_team_coach(team_id));

-- Revive 5 Player Goals
CREATE TABLE public.revive5_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  team_id uuid REFERENCES public.teams(id),
  category_id uuid NOT NULL REFERENCES public.revive5_categories(id),
  title text NOT NULL,
  description text,
  target_value integer DEFAULT 90,
  current_value integer DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + interval '90 days')::date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.revive5_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revive5 goals" ON public.revive5_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own revive5 goals" ON public.revive5_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revive5 goals" ON public.revive5_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revive5 goals" ON public.revive5_goals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Coaches can view team revive5 goals" ON public.revive5_goals FOR SELECT USING (team_id IS NOT NULL AND is_team_coach(team_id));

-- Revive 5 Goal Tasks
CREATE TABLE public.revive5_goal_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid NOT NULL REFERENCES public.revive5_goals(id),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.revive5_categories(id),
  title text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.revive5_goal_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revive5 tasks" ON public.revive5_goal_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own revive5 tasks" ON public.revive5_goal_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revive5 tasks" ON public.revive5_goal_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revive5 tasks" ON public.revive5_goal_tasks FOR DELETE USING (auth.uid() = user_id);

-- Revive 5 Task Completions
CREATE TABLE public.revive5_task_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.revive5_goal_tasks(id),
  user_id uuid NOT NULL,
  completion_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, completion_date)
);

ALTER TABLE public.revive5_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revive5 completions" ON public.revive5_task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own revive5 completions" ON public.revive5_task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revive5 completions" ON public.revive5_task_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revive5 completions" ON public.revive5_task_completions FOR DELETE USING (auth.uid() = user_id);

-- Add FK for goal_id in checkins
ALTER TABLE public.revive5_checkins ADD CONSTRAINT revive5_checkins_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.revive5_goals(id);
