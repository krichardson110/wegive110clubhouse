import { MapPin, Clock } from "lucide-react";

export type EventType = "game" | "practice" | "team-meeting" | "workout" | "off-day";

export interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  endTime?: string;
  type: EventType;
  location?: string;
  opponent?: string;
  notes?: string;
  isHome?: boolean;
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

// Helper to create dates relative to today
const getDate = (daysFromNow: number, month?: number, day?: number) => {
  const date = new Date();
  if (month !== undefined && day !== undefined) {
    date.setMonth(month);
    date.setDate(day);
  } else {
    date.setDate(date.getDate() + daysFromNow);
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

export const scheduleEvents: ScheduleEvent[] = [
  // This week
  {
    id: "1",
    title: "Team Practice",
    date: getDate(0),
    time: "3:30 PM",
    endTime: "5:30 PM",
    type: "practice",
    location: "Main Field",
    notes: "Focus on base running and situational hitting",
  },
  {
    id: "2",
    title: "vs. Eastside Eagles",
    date: getDate(1),
    time: "6:00 PM",
    type: "game",
    location: "Home Field",
    opponent: "Eastside Eagles",
    isHome: true,
    notes: "League game - arrive by 4:30 PM",
  },
  {
    id: "3",
    title: "Morning Workout",
    date: getDate(2),
    time: "7:00 AM",
    endTime: "8:30 AM",
    type: "workout",
    location: "Weight Room",
    notes: "Lower body strength focus",
  },
  {
    id: "4",
    title: "Team Practice",
    date: getDate(2),
    time: "3:30 PM",
    endTime: "5:30 PM",
    type: "practice",
    location: "Main Field",
  },
  {
    id: "5",
    title: "@ Westbrook Warriors",
    date: getDate(3),
    time: "5:00 PM",
    type: "game",
    location: "Westbrook High School",
    opponent: "Westbrook Warriors",
    isHome: false,
    notes: "Bus leaves at 3:30 PM from school parking lot",
  },
  {
    id: "6",
    title: "Off Day",
    date: getDate(4),
    time: "All Day",
    type: "off-day",
    notes: "Rest and recovery - optional film study available",
  },
  {
    id: "7",
    title: "Team Practice",
    date: getDate(5),
    time: "10:00 AM",
    endTime: "12:00 PM",
    type: "practice",
    location: "Main Field",
    notes: "Pitchers and catchers extra work at 9:00 AM",
  },
  {
    id: "8",
    title: "vs. North Valley Knights",
    date: getDate(6),
    time: "1:00 PM",
    type: "game",
    location: "Home Field",
    opponent: "North Valley Knights",
    isHome: true,
    notes: "Double header - Game 2 at 4:00 PM",
  },
  // Next week
  {
    id: "9",
    title: "Team Meeting",
    date: getDate(7),
    time: "4:00 PM",
    endTime: "5:00 PM",
    type: "team-meeting",
    location: "Team Room",
    notes: "Film review from weekend games",
  },
  {
    id: "10",
    title: "Team Practice",
    date: getDate(8),
    time: "3:30 PM",
    endTime: "5:30 PM",
    type: "practice",
    location: "Main Field",
  },
  {
    id: "11",
    title: "Morning Workout",
    date: getDate(9),
    time: "6:30 AM",
    endTime: "8:00 AM",
    type: "workout",
    location: "Weight Room",
    notes: "Upper body and core",
  },
  {
    id: "12",
    title: "@ Central Tigers",
    date: getDate(10),
    time: "7:00 PM",
    type: "game",
    location: "Central High School",
    opponent: "Central Tigers",
    isHome: false,
    notes: "Rivalry game - full dress code required",
  },
  {
    id: "13",
    title: "Team Practice",
    date: getDate(12),
    time: "3:30 PM",
    endTime: "5:30 PM",
    type: "practice",
    location: "Main Field",
  },
  {
    id: "14",
    title: "vs. South Bay Sharks",
    date: getDate(13),
    time: "4:00 PM",
    type: "game",
    location: "Home Field",
    opponent: "South Bay Sharks",
    isHome: true,
  },
];

// Get events for a specific date
export const getEventsForDate = (date: Date): ScheduleEvent[] => {
  return scheduleEvents.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    );
  });
};

// Get dates that have events (for highlighting in calendar)
export const getDatesWithEvents = (): Date[] => {
  return scheduleEvents.map(event => new Date(event.date));
};
