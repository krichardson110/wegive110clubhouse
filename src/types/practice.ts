export type PracticeSeason = 'fall' | 'spring' | 'summer' | 'winter';
export type PracticePhase = 'off-season' | 'pre-season' | 'in-season' | 'post-season' | 'strength' | 'speed' | 'skills';

export interface Practice {
  id: string;
  title: string;
  description?: string | null;
  practice_date: string;
  start_time: string;
  end_time?: string | null;
  duration_minutes: number;
  season: PracticeSeason;
  phase: PracticePhase;
  location?: string | null;
  focus_areas?: string[] | null;
  equipment_needed?: string[] | null;
  notes?: string | null;
  published: boolean;
  team_id?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  drills?: PracticeDrill[];
}

export interface PracticeDrill {
  id: string;
  practice_id: string;
  drill_order: number;
  phase_name: string;
  drill_number?: number | null;
  drill_name: string;
  description?: string | null;
  coaching_points?: string[] | null;
  duration_minutes: number;
  diagram_url?: string | null;
  video_url?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PracticeTemplate {
  id: string;
  title: string;
  description?: string | null;
  season?: PracticeSeason | null;
  phase?: PracticePhase | null;
  duration_minutes: number;
  focus_areas?: string[] | null;
  template_drills: TemplateDrill[];
  is_public: boolean;
  created_by: string;
  team_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateDrill {
  phase_name: string;
  drill_number?: number;
  drill_name: string;
  description?: string;
  coaching_points?: string[];
  duration_minutes: number;
  notes?: string;
}

export const seasonConfig: Record<PracticeSeason, { label: string; color: string; bgColor: string }> = {
  fall: { label: 'Fall', color: 'text-orange-400', bgColor: 'bg-orange-500/20 border-orange-500/40' },
  spring: { label: 'Spring', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/40' },
  summer: { label: 'Summer', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/40' },
  winter: { label: 'Winter', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/40' },
};

export const phaseConfig: Record<PracticePhase, { label: string; color: string; bgColor: string }> = {
  'off-season': { label: 'Off Season', color: 'text-muted-foreground', bgColor: 'bg-muted/50 border-muted' },
  'pre-season': { label: 'Pre Season', color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/40' },
  'in-season': { label: 'In Season', color: 'text-primary', bgColor: 'bg-primary/20 border-primary/40' },
  'post-season': { label: 'Post Season', color: 'text-accent', bgColor: 'bg-accent/20 border-accent/40' },
  'strength': { label: 'Strength', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/40' },
  'speed': { label: 'Speed', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20 border-cyan-500/40' },
  'skills': { label: 'Skills', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/40' },
};

export const seasons: PracticeSeason[] = ['fall', 'spring', 'summer', 'winter'];
export const phases: PracticePhase[] = ['off-season', 'pre-season', 'in-season', 'post-season', 'strength', 'speed', 'skills'];

export const drillPhases = [
  'Arm Care',
  'Warmup Routine',
  'Throwing Routine',
  'Infield Routine',
  'Outfield Routine',
  'Catcher Routine',
  'Hitting Routine',
  'Baserunning',
  'Cutoff Routine',
  'Competition WOD',
  'Team Standards',
  'Cool Down',
  'Team Meeting',
];

export const focusAreaOptions = [
  'Fielding',
  'Hitting',
  'Pitching',
  'Catching',
  'Baserunning',
  'Throwing',
  'Conditioning',
  'Team Defense',
  'Situational Play',
  'Mental Game',
];
