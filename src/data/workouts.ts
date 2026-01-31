import { Dumbbell, Timer, Flame, Target, Zap, Heart } from "lucide-react";

export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  exercises: number;
}

export interface WorkoutCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  workouts: Workout[];
}

export const workoutCategories: WorkoutCategory[] = [
  {
    id: "strength",
    name: "Strength Training",
    description: "Build power and explosiveness for the diamond",
    icon: Dumbbell,
    color: "from-red-500/20 to-red-600/20 border-red-500/40",
    workouts: [
      {
        id: "s1",
        title: "Lower Body Power",
        description: "Squats, deadlifts, and plyometrics to build leg drive",
        duration: "45 min",
        difficulty: "Intermediate",
        exercises: 8,
      },
      {
        id: "s2",
        title: "Upper Body Strength",
        description: "Chest, back, and shoulder compound movements",
        duration: "40 min",
        difficulty: "Intermediate",
        exercises: 7,
      },
      {
        id: "s3",
        title: "Core Stability",
        description: "Anti-rotation and rotational power for hitting and throwing",
        duration: "30 min",
        difficulty: "Beginner",
        exercises: 10,
      },
      {
        id: "s4",
        title: "Total Body Power",
        description: "Olympic lifts and explosive movements",
        duration: "50 min",
        difficulty: "Advanced",
        exercises: 6,
      },
    ],
  },
  {
    id: "speed",
    name: "Speed & Agility",
    description: "Get faster on the bases and in the field",
    icon: Zap,
    color: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/40",
    workouts: [
      {
        id: "sp1",
        title: "Base Running Drills",
        description: "First step quickness and acceleration to first base",
        duration: "35 min",
        difficulty: "Beginner",
        exercises: 6,
      },
      {
        id: "sp2",
        title: "Lateral Quickness",
        description: "Defensive agility for infielders and outfielders",
        duration: "30 min",
        difficulty: "Intermediate",
        exercises: 8,
      },
      {
        id: "sp3",
        title: "Sprint Training",
        description: "60-yard dash improvement and top-end speed",
        duration: "40 min",
        difficulty: "Advanced",
        exercises: 5,
      },
    ],
  },
  {
    id: "arm-care",
    name: "Arm Care",
    description: "Keep your arm healthy and throwing strong",
    icon: Heart,
    color: "from-pink-500/20 to-pink-600/20 border-pink-500/40",
    workouts: [
      {
        id: "a1",
        title: "Pre-Throwing Routine",
        description: "Band work and mobility before throwing",
        duration: "15 min",
        difficulty: "Beginner",
        exercises: 12,
      },
      {
        id: "a2",
        title: "Rotator Cuff Strengthening",
        description: "Internal and external rotation exercises",
        duration: "25 min",
        difficulty: "Beginner",
        exercises: 8,
      },
      {
        id: "a3",
        title: "Post-Game Recovery",
        description: "Cool down and recovery for pitchers",
        duration: "20 min",
        difficulty: "Beginner",
        exercises: 10,
      },
    ],
  },
  {
    id: "hitting",
    name: "Hitting Mechanics",
    description: "Drills to improve your swing and bat speed",
    icon: Target,
    color: "from-accent/20 to-clubhouse-orange-light/20 border-accent/40",
    workouts: [
      {
        id: "h1",
        title: "Tee Work Fundamentals",
        description: "Swing path and contact point drills",
        duration: "30 min",
        difficulty: "Beginner",
        exercises: 6,
      },
      {
        id: "h2",
        title: "Soft Toss Progressions",
        description: "Timing and rhythm with front toss variations",
        duration: "35 min",
        difficulty: "Intermediate",
        exercises: 8,
      },
      {
        id: "h3",
        title: "Bat Speed Training",
        description: "Overload/underload and resistance training",
        duration: "25 min",
        difficulty: "Advanced",
        exercises: 5,
      },
    ],
  },
  {
    id: "conditioning",
    name: "Conditioning",
    description: "Build endurance for the long season",
    icon: Flame,
    color: "from-primary/20 to-clubhouse-purple-light/20 border-primary/40",
    workouts: [
      {
        id: "c1",
        title: "Baseball HIIT",
        description: "High intensity intervals for game-like conditioning",
        duration: "25 min",
        difficulty: "Intermediate",
        exercises: 8,
      },
      {
        id: "c2",
        title: "Pitcher's Conditioning",
        description: "Leg endurance and recovery runs",
        duration: "30 min",
        difficulty: "Intermediate",
        exercises: 6,
      },
      {
        id: "c3",
        title: "Position Player Circuit",
        description: "Full body conditioning for everyday players",
        duration: "35 min",
        difficulty: "Intermediate",
        exercises: 10,
      },
    ],
  },
  {
    id: "mobility",
    name: "Mobility & Recovery",
    description: "Stay flexible and prevent injuries",
    icon: Timer,
    color: "from-teal-500/20 to-teal-600/20 border-teal-500/40",
    workouts: [
      {
        id: "m1",
        title: "Dynamic Warm-Up",
        description: "Full body activation before practice or games",
        duration: "15 min",
        difficulty: "Beginner",
        exercises: 12,
      },
      {
        id: "m2",
        title: "Hip Mobility Flow",
        description: "Open up hips for hitting and fielding",
        duration: "20 min",
        difficulty: "Beginner",
        exercises: 8,
      },
      {
        id: "m3",
        title: "Recovery Day Routine",
        description: "Light stretching and foam rolling",
        duration: "25 min",
        difficulty: "Beginner",
        exercises: 10,
      },
    ],
  },
];
