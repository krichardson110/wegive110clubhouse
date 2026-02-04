
-- Create workout_categories table
CREATE TABLE public.workout_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Dumbbell',
  color_gradient TEXT NOT NULL DEFAULT 'from-primary/20 to-accent/20 border-primary/40',
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.workout_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  difficulty TEXT NOT NULL DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  exercises INTEGER NOT NULL DEFAULT 0,
  youtube_id TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workout_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Anyone can view published workout categories" 
ON public.workout_categories 
FOR SELECT 
USING (published = true);

CREATE POLICY "Anyone can view published workouts" 
ON public.workouts 
FOR SELECT 
USING (published = true AND EXISTS (
  SELECT 1 FROM public.workout_categories wc 
  WHERE wc.id = workouts.category_id AND wc.published = true
));

-- Super admin full access
CREATE POLICY "Super admin can manage workout categories" 
ON public.workout_categories 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Super admin can manage workouts" 
ON public.workouts 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_workout_categories_updated_at
BEFORE UPDATE ON public.workout_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial workout categories
INSERT INTO public.workout_categories (name, description, icon_name, color_gradient, display_order) VALUES
('Strength Training', 'Build power and explosiveness for the diamond', 'Dumbbell', 'from-red-500/20 to-red-600/20 border-red-500/40', 1),
('Speed & Agility', 'Get faster on the bases and in the field', 'Zap', 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40', 2),
('Arm Care', 'Keep your arm healthy and throwing strong', 'Heart', 'from-pink-500/20 to-pink-600/20 border-pink-500/40', 3),
('Hitting Mechanics', 'Drills to improve your swing and bat speed', 'Target', 'from-accent/20 to-clubhouse-orange-light/20 border-accent/40', 4),
('Conditioning', 'Build endurance for the long season', 'Flame', 'from-primary/20 to-clubhouse-purple-light/20 border-primary/40', 5),
('Mobility & Recovery', 'Stay flexible and prevent injuries', 'Timer', 'from-teal-500/20 to-teal-600/20 border-teal-500/40', 6);

-- Insert initial workouts (Strength Training)
INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Lower Body Power', 'Squats, deadlifts, and plyometrics to build leg drive', '45 min', 'Intermediate', 8, 1
FROM public.workout_categories WHERE name = 'Strength Training';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Upper Body Strength', 'Chest, back, and shoulder compound movements', '40 min', 'Intermediate', 7, 2
FROM public.workout_categories WHERE name = 'Strength Training';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Core Stability', 'Anti-rotation and rotational power for hitting and throwing', '30 min', 'Beginner', 10, 3
FROM public.workout_categories WHERE name = 'Strength Training';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Total Body Power', 'Olympic lifts and explosive movements', '50 min', 'Advanced', 6, 4
FROM public.workout_categories WHERE name = 'Strength Training';

-- Insert workouts (Speed & Agility)
INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Base Running Drills', 'First step quickness and acceleration to first base', '35 min', 'Beginner', 6, 1
FROM public.workout_categories WHERE name = 'Speed & Agility';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Lateral Quickness', 'Defensive agility for infielders and outfielders', '30 min', 'Intermediate', 8, 2
FROM public.workout_categories WHERE name = 'Speed & Agility';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Sprint Training', '60-yard dash improvement and top-end speed', '40 min', 'Advanced', 5, 3
FROM public.workout_categories WHERE name = 'Speed & Agility';

-- Insert workouts (Arm Care)
INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Pre-Throwing Routine', 'Band work and mobility before throwing', '15 min', 'Beginner', 12, 1
FROM public.workout_categories WHERE name = 'Arm Care';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Rotator Cuff Strengthening', 'Internal and external rotation exercises', '25 min', 'Beginner', 8, 2
FROM public.workout_categories WHERE name = 'Arm Care';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Post-Game Recovery', 'Cool down and recovery for pitchers', '20 min', 'Beginner', 10, 3
FROM public.workout_categories WHERE name = 'Arm Care';

-- Insert workouts (Hitting Mechanics)
INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Tee Work Fundamentals', 'Swing path and contact point drills', '30 min', 'Beginner', 6, 1
FROM public.workout_categories WHERE name = 'Hitting Mechanics';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Soft Toss Progressions', 'Timing and rhythm with front toss variations', '35 min', 'Intermediate', 8, 2
FROM public.workout_categories WHERE name = 'Hitting Mechanics';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Bat Speed Training', 'Overload/underload and resistance training', '25 min', 'Advanced', 5, 3
FROM public.workout_categories WHERE name = 'Hitting Mechanics';

-- Insert workouts (Conditioning)
INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Baseball HIIT', 'High intensity intervals for game-like conditioning', '25 min', 'Intermediate', 8, 1
FROM public.workout_categories WHERE name = 'Conditioning';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Pitcher''s Conditioning', 'Leg endurance and recovery runs', '30 min', 'Intermediate', 6, 2
FROM public.workout_categories WHERE name = 'Conditioning';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Position Player Circuit', 'Full body conditioning for everyday players', '35 min', 'Intermediate', 10, 3
FROM public.workout_categories WHERE name = 'Conditioning';

-- Insert workouts (Mobility & Recovery)
INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Dynamic Warm-Up', 'Full body activation before practice or games', '15 min', 'Beginner', 12, 1
FROM public.workout_categories WHERE name = 'Mobility & Recovery';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Hip Mobility Flow', 'Open up hips for hitting and fielding', '20 min', 'Beginner', 8, 2
FROM public.workout_categories WHERE name = 'Mobility & Recovery';

INSERT INTO public.workouts (category_id, title, description, duration, difficulty, exercises, display_order)
SELECT id, 'Recovery Day Routine', 'Light stretching and foam rolling', '25 min', 'Beginner', 10, 3
FROM public.workout_categories WHERE name = 'Mobility & Recovery';
