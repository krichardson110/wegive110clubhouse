import { Dumbbell, Timer, Flame, Target, Zap, Heart, LucideIcon } from "lucide-react";

export interface WorkoutCategory {
  id: string;
  name: string;
  description: string | null;
  icon_name: string;
  color_gradient: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  workouts?: Workout[];
}

export interface Workout {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  duration: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  exercises: number;
  youtube_id: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Map icon names to actual components
export const iconMap: Record<string, LucideIcon> = {
  Dumbbell,
  Timer,
  Flame,
  Target,
  Zap,
  Heart,
};

export const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Dumbbell;
};
