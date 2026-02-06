export type EventType = "game" | "practice" | "team-meeting" | "workout" | "off-day";

export interface ScheduleEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  end_time?: string | null;
  event_type: EventType;
  location?: string | null;
  opponent?: string | null;
  notes?: string | null;
  is_home?: boolean | null;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export const eventTypeConfig: Record<EventType, { label: string; color: string; bgColor: string }> = {
  game: { 
    label: "Game", 
    color: "text-accent", 
    bgColor: "bg-accent/20 border-accent/40" 
  },
  practice: { 
    label: "Practice", 
    color: "text-primary", 
    bgColor: "bg-primary/20 border-primary/40" 
  },
  "team-meeting": { 
    label: "Team Meeting", 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/20 border-blue-500/40" 
  },
  workout: { 
    label: "Workout", 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/20 border-emerald-500/40" 
  },
  "off-day": { 
    label: "Off Day", 
    color: "text-muted-foreground", 
    bgColor: "bg-muted/50 border-muted" 
  },
};

export const eventTypes: EventType[] = ["game", "practice", "team-meeting", "workout", "off-day"];
