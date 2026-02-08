-- Create season and phase enums
CREATE TYPE public.practice_season AS ENUM ('fall', 'spring', 'summer', 'winter');
CREATE TYPE public.practice_phase AS ENUM ('off-season', 'pre-season', 'in-season', 'post-season', 'strength', 'speed', 'skills');

-- Create practices table
CREATE TABLE public.practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  practice_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  duration_minutes INTEGER DEFAULT 120,
  season practice_season NOT NULL DEFAULT 'spring',
  phase practice_phase NOT NULL DEFAULT 'in-season',
  location TEXT,
  focus_areas TEXT[], -- e.g., ['fielding', 'hitting', 'baserunning']
  equipment_needed TEXT[],
  notes TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice_drills table (structure from spreadsheet)
CREATE TABLE public.practice_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  drill_order INTEGER NOT NULL DEFAULT 0,
  phase_name TEXT NOT NULL, -- e.g., 'Arm Care', 'Warmup Routine', 'Throwing Routine'
  drill_number INTEGER,
  drill_name TEXT NOT NULL,
  description TEXT,
  coaching_points TEXT[],
  duration_minutes INTEGER DEFAULT 10,
  diagram_url TEXT,
  video_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice templates table for reusable practice plans
CREATE TABLE public.practice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  season practice_season,
  phase practice_phase,
  duration_minutes INTEGER DEFAULT 120,
  focus_areas TEXT[],
  template_drills JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_templates ENABLE ROW LEVEL SECURITY;

-- Practices RLS Policies
-- Super admin can manage all practices
CREATE POLICY "Super admin can manage all practices"
ON public.practices
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Team coaches can manage their team practices
CREATE POLICY "Team coaches can manage team practices"
ON public.practices
FOR ALL
USING (team_id IS NOT NULL AND is_team_coach(team_id))
WITH CHECK (team_id IS NOT NULL AND is_team_coach(team_id));

-- Team members can view their team practices (published only)
CREATE POLICY "Team members can view team practices"
ON public.practices
FOR SELECT
USING (
  (team_id IS NOT NULL AND is_team_member(team_id) AND published = true)
  OR
  (team_id IS NULL AND published = true) -- org-wide practices
);

-- Practice Drills RLS Policies
-- Super admin can manage all drills
CREATE POLICY "Super admin can manage all drills"
ON public.practice_drills
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Team coaches can manage drills for their practices
CREATE POLICY "Team coaches can manage practice drills"
ON public.practice_drills
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.practices p
    WHERE p.id = practice_drills.practice_id
    AND p.team_id IS NOT NULL
    AND is_team_coach(p.team_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.practices p
    WHERE p.id = practice_drills.practice_id
    AND p.team_id IS NOT NULL
    AND is_team_coach(p.team_id)
  )
);

-- Team members can view drills for published practices
CREATE POLICY "Team members can view practice drills"
ON public.practice_drills
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.practices p
    WHERE p.id = practice_drills.practice_id
    AND (
      (p.team_id IS NOT NULL AND is_team_member(p.team_id) AND p.published = true)
      OR
      (p.team_id IS NULL AND p.published = true)
    )
  )
);

-- Practice Templates RLS Policies
CREATE POLICY "Super admin can manage all templates"
ON public.practice_templates
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Team coaches can manage their templates"
ON public.practice_templates
FOR ALL
USING (
  (team_id IS NOT NULL AND is_team_coach(team_id))
  OR
  (created_by = auth.uid())
)
WITH CHECK (
  (team_id IS NOT NULL AND is_team_coach(team_id))
  OR
  (created_by = auth.uid())
);

CREATE POLICY "Users can view public templates"
ON public.practice_templates
FOR SELECT
USING (is_public = true OR created_by = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_practices_team_id ON public.practices(team_id);
CREATE INDEX idx_practices_date ON public.practices(practice_date);
CREATE INDEX idx_practices_season_phase ON public.practices(season, phase);
CREATE INDEX idx_practice_drills_practice_id ON public.practice_drills(practice_id);
CREATE INDEX idx_practice_drills_order ON public.practice_drills(practice_id, drill_order);

-- Add triggers for updated_at
CREATE TRIGGER update_practices_updated_at
BEFORE UPDATE ON public.practices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practice_drills_updated_at
BEFORE UPDATE ON public.practice_drills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practice_templates_updated_at
BEFORE UPDATE ON public.practice_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();