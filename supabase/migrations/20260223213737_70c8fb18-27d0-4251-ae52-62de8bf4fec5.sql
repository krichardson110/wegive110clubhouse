
-- Table for recurring task definitions linked to goals
CREATE TABLE public.goal_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.player_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.drive5_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_tasks ENABLE ROW LEVEL SECURITY;

-- Users can manage own tasks
CREATE POLICY "Users can manage own tasks"
ON public.goal_tasks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Coaches can view team player tasks
CREATE POLICY "Coaches can view team player tasks"
ON public.goal_tasks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM player_goals pg
  WHERE pg.id = goal_tasks.goal_id
  AND pg.team_id IS NOT NULL
  AND is_team_coach(pg.team_id)
));

-- Table for daily task completions
CREATE TABLE public.task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.goal_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, completion_date)
);

-- Enable RLS
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- Users can manage own completions
CREATE POLICY "Users can manage own completions"
ON public.task_completions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Coaches can view team completions
CREATE POLICY "Coaches can view team completions"
ON public.task_completions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM goal_tasks gt
  JOIN player_goals pg ON pg.id = gt.goal_id
  WHERE gt.id = task_completions.task_id
  AND pg.team_id IS NOT NULL
  AND is_team_coach(pg.team_id)
));

-- Trigger for updated_at on goal_tasks
CREATE TRIGGER update_goal_tasks_updated_at
BEFORE UPDATE ON public.goal_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
