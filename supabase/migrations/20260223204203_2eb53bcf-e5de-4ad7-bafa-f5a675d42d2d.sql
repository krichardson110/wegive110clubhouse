
-- Drive 5 Categories (the 5 training pillars)
CREATE TABLE public.drive5_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT '⚾',
  color_gradient text NOT NULL DEFAULT 'from-primary/20 to-accent/20',
  display_order integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the 5 categories
INSERT INTO public.drive5_categories (name, icon, color_gradient, display_order, description) VALUES
  ('Skills & Drills', '⚾', 'from-orange-500/20 to-orange-600/20', 0, 'Hitting, fielding, and throwing drills'),
  ('Cardio & Agility', '⚡', 'from-yellow-500/20 to-yellow-600/20', 1, 'Speed, agility, and endurance work'),
  ('Rest & Refuel', '🌙', 'from-blue-500/20 to-blue-600/20', 2, 'Sleep, nutrition, and recovery'),
  ('Strength & Power', '💪', 'from-red-500/20 to-red-600/20', 3, 'Weight training and power exercises'),
  ('Mental & Strategy', '🧠', 'from-purple-500/20 to-purple-600/20', 4, 'Visualization and game strategy');

ALTER TABLE public.drive5_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.drive5_categories FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage categories"
  ON public.drive5_categories FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Player 90-day goals
CREATE TABLE public.player_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.drive5_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value integer DEFAULT 90,
  current_value integer DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + interval '90 days')::date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.player_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON public.player_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON public.player_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.player_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.player_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view team player goals"
  ON public.player_goals FOR SELECT
  USING (team_id IS NOT NULL AND is_team_coach(team_id));

CREATE POLICY "Parents can view their players goals"
  ON public.player_goals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.role = 'parent'
    AND tm.team_id = player_goals.team_id
    AND tm.status = 'active'
  ));

CREATE TRIGGER update_player_goals_updated_at
  BEFORE UPDATE ON public.player_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Daily check-ins (daily progress per category)
CREATE TABLE public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.drive5_categories(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.player_goals(id) ON DELETE SET NULL,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT false,
  notes text,
  duration_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, checkin_date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON public.daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON public.daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON public.daily_checkins FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view team checkins"
  ON public.daily_checkins FOR SELECT
  USING (team_id IS NOT NULL AND is_team_coach(team_id));

CREATE POLICY "Parents can view their players checkins"
  ON public.daily_checkins FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.role = 'parent'
    AND tm.team_id = daily_checkins.team_id
    AND tm.status = 'active'
  ));

CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Player streaks (calculated/cached)
CREATE TABLE public.player_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_checkin_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

ALTER TABLE public.player_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON public.player_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks"
  ON public.player_streaks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view team streaks"
  ON public.player_streaks FOR SELECT
  USING (team_id IS NOT NULL AND is_team_coach(team_id));

CREATE POLICY "Parents can view their players streaks"
  ON public.player_streaks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.role = 'parent'
    AND tm.team_id = player_streaks.team_id
    AND tm.status = 'active'
  ));
