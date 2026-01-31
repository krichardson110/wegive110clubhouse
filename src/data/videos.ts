import { Brain, Flame, Heart, Target, Dumbbell, Users } from "lucide-react";

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  category: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  videos: Video[];
}

export const videoCategories: VideoCategory[] = [
  {
    id: "hitting",
    name: "Hitting Drills",
    description: "Improve your swing mechanics and bat speed",
    icon: Target,
    color: "from-accent/20 to-clubhouse-orange-light/20 border-accent/40",
    videos: [
      {
        id: "h1",
        title: "Tee Work Fundamentals",
        description: "Master the basics of hitting off the tee with proper stance and swing path",
        youtubeId: "dQw4w9WgXcQ",
        duration: "8:24",
        category: "hitting",
      },
      {
        id: "h2",
        title: "Front Toss Progressions",
        description: "Build timing and rhythm with soft toss variations",
        youtubeId: "dQw4w9WgXcQ",
        duration: "12:15",
        category: "hitting",
      },
      {
        id: "h3",
        title: "Bat Speed Training",
        description: "Overload and underload training for more power",
        youtubeId: "dQw4w9WgXcQ",
        duration: "15:30",
        category: "hitting",
      },
      {
        id: "h4",
        title: "Two-Strike Approach",
        description: "Adjustments to make with two strikes",
        youtubeId: "dQw4w9WgXcQ",
        duration: "10:45",
        category: "hitting",
      },
    ],
  },
  {
    id: "pitching",
    name: "Pitching & Throwing",
    description: "Mechanics, arm care, and pitch development",
    icon: Flame,
    color: "from-red-500/20 to-red-600/20 border-red-500/40",
    videos: [
      {
        id: "p1",
        title: "Proper Throwing Mechanics",
        description: "Foundation of a healthy and effective throwing motion",
        youtubeId: "dQw4w9WgXcQ",
        duration: "14:20",
        category: "pitching",
      },
      {
        id: "p2",
        title: "Long Toss Program",
        description: "Build arm strength with progressive long toss",
        youtubeId: "dQw4w9WgXcQ",
        duration: "11:00",
        category: "pitching",
      },
      {
        id: "p3",
        title: "Breaking Ball Grips",
        description: "Curveball and slider grip techniques",
        youtubeId: "dQw4w9WgXcQ",
        duration: "9:45",
        category: "pitching",
      },
    ],
  },
  {
    id: "fielding",
    name: "Fielding & Defense",
    description: "Ground balls, fly balls, and defensive positioning",
    icon: Dumbbell,
    color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/40",
    videos: [
      {
        id: "f1",
        title: "Ground Ball Fundamentals",
        description: "Proper footwork and glove work for infielders",
        youtubeId: "dQw4w9WgXcQ",
        duration: "13:30",
        category: "fielding",
      },
      {
        id: "f2",
        title: "Outfield Drop Steps",
        description: "First step reactions and routes to fly balls",
        youtubeId: "dQw4w9WgXcQ",
        duration: "10:15",
        category: "fielding",
      },
      {
        id: "f3",
        title: "Double Play Turns",
        description: "Middle infield footwork for turning two",
        youtubeId: "dQw4w9WgXcQ",
        duration: "12:00",
        category: "fielding",
      },
    ],
  },
  {
    id: "mind",
    name: "Mental Game",
    description: "Build mental toughness and confidence",
    icon: Brain,
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/40",
    videos: [
      {
        id: "m1",
        title: "Overcoming Pressure",
        description: "Mental strategies for high-pressure situations",
        youtubeId: "dQw4w9WgXcQ",
        duration: "18:45",
        category: "mind",
      },
      {
        id: "m2",
        title: "Visualization Techniques",
        description: "Use mental imagery to improve performance",
        youtubeId: "dQw4w9WgXcQ",
        duration: "12:30",
        category: "mind",
      },
      {
        id: "m3",
        title: "Pre-Game Routine",
        description: "Mental preparation before competition",
        youtubeId: "dQw4w9WgXcQ",
        duration: "15:20",
        category: "mind",
      },
    ],
  },
  {
    id: "spirit",
    name: "Leadership & Character",
    description: "Develop as a leader and teammate",
    icon: Heart,
    color: "from-primary/20 to-clubhouse-purple-light/20 border-primary/40",
    videos: [
      {
        id: "s1",
        title: "Being a Great Teammate",
        description: "How to support and elevate your team",
        youtubeId: "dQw4w9WgXcQ",
        duration: "14:00",
        category: "spirit",
      },
      {
        id: "s2",
        title: "Handling Adversity",
        description: "Responding to failure with resilience",
        youtubeId: "dQw4w9WgXcQ",
        duration: "16:30",
        category: "spirit",
      },
      {
        id: "s3",
        title: "Finding Your Why",
        description: "Purpose-driven play and motivation",
        youtubeId: "dQw4w9WgXcQ",
        duration: "11:45",
        category: "spirit",
      },
    ],
  },
  {
    id: "zoom",
    name: "Zoom Recordings",
    description: "Past team meetings and coaching sessions",
    icon: Users,
    color: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/40",
    videos: [
      {
        id: "z1",
        title: "Coach's Corner: Season Goals",
        description: "Team meeting discussing our goals for the season",
        youtubeId: "dQw4w9WgXcQ",
        duration: "45:00",
        category: "zoom",
      },
      {
        id: "z2",
        title: "Guest Speaker: Pro Scout",
        description: "What scouts look for in prospects",
        youtubeId: "dQw4w9WgXcQ",
        duration: "52:30",
        category: "zoom",
      },
      {
        id: "z3",
        title: "Film Study: Game Breakdown",
        description: "Analyzing our last game performance",
        youtubeId: "dQw4w9WgXcQ",
        duration: "38:15",
        category: "zoom",
      },
    ],
  },
];
