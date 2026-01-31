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
        title: "The Step Back Drill",
        description: "Fix lunging issues and control stride length and direction with this youth hitting drill",
        youtubeId: "oBk4EUB3kdk",
        duration: "5:42",
        category: "hitting",
      },
      {
        id: "h2",
        title: "The Kershaw Drill",
        description: "Control the stride phase of your swing with this effective progression drill",
        youtubeId: "0LA8va0KPOk",
        duration: "4:18",
        category: "hitting",
      },
      {
        id: "h3",
        title: "Offset Open Drill",
        description: "Improve barrel direction and learn to hit opposite field with authority",
        youtubeId: "GmBh2ekAK7A",
        duration: "5:15",
        category: "hitting",
      },
      {
        id: "h4",
        title: "Improve Your Timing",
        description: "Easy hitting drill to develop better timing at the plate",
        youtubeId: "6drzyv97TBM",
        duration: "8:24",
        category: "hitting",
      },
      {
        id: "h5",
        title: "3 Best Youth Hitting Drills",
        description: "Top three drills every youth baseball player should practice",
        youtubeId: "jZeIG-gK2Ik",
        duration: "10:30",
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
        title: "Pitching Accuracy Drills",
        description: "4 key areas and 5 drills to improve your pitching accuracy",
        youtubeId: "9tWZEBWuSco",
        duration: "14:20",
        category: "pitching",
      },
      {
        id: "p2",
        title: "Youth Pitching Drills (9-12)",
        description: "Age-appropriate pitching drills for youth players",
        youtubeId: "q8FaTf5sk7M",
        duration: "11:45",
        category: "pitching",
      },
      {
        id: "p3",
        title: "Accuracy Drills for 8u+",
        description: "Baseball accuracy pitching drills for young pitchers",
        youtubeId: "qwnvUICBWhQ",
        duration: "9:30",
        category: "pitching",
      },
      {
        id: "p4",
        title: "5 Beginner Pitching Drills",
        description: "Easy pitching mechanics drills for youth players learning to pitch",
        youtubeId: "W0Op6Hhrqt4",
        duration: "12:15",
        category: "pitching",
      },
      {
        id: "p5",
        title: "Youth Pitching Mechanics Guide",
        description: "Complete guide for parents and coaches on youth pitching mechanics",
        youtubeId: "4NOo7JSK6eA",
        duration: "18:00",
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
        title: "4 High-Energy Infield Drills",
        description: "Dynamic drills including Bobble and Recover and Football Drill",
        youtubeId: "U9Gr4OnGJQA",
        duration: "13:30",
        category: "fielding",
      },
      {
        id: "f2",
        title: "5 Infield Footwork Drills",
        description: "Sharpen footwork with drills like In-and-Out and Line Drill",
        youtubeId: "HzqKlzNodIM",
        duration: "10:15",
        category: "fielding",
      },
      {
        id: "f3",
        title: "Movement Drills for Infielders",
        description: "Elite movement patterns and reactions for middle infielders",
        youtubeId: "QVczd5i7VoI",
        duration: "12:00",
        category: "fielding",
      },
      {
        id: "f4",
        title: "15 Minute Infield Warm-Up",
        description: "Complete infield warm-up routine with fundamental drills",
        youtubeId: "4r-lEaGyVPU",
        duration: "15:20",
        category: "fielding",
      },
      {
        id: "f5",
        title: "Catcher Receiving & Throwing",
        description: "Essential drills for catchers to improve receiving and pop times",
        youtubeId: "kQDu_UF8P7g",
        duration: "11:00",
        category: "fielding",
      },
      {
        id: "f6",
        title: "5 Best Catcher Throwing Drills",
        description: "Improve your throwing mechanics and get faster pop times",
        youtubeId: "vLLw9ZcqMDw",
        duration: "14:30",
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
        title: "Improve Your Mental Game",
        description: "Understanding how the brain functions to improve performance",
        youtubeId: "vomSBUNUUjg",
        duration: "18:45",
        category: "mind",
      },
      {
        id: "m2",
        title: "Bobby Witt Jr.'s Mental Training",
        description: "Mental performance system for calm, confident hitting under pressure",
        youtubeId: "lYyZc3YK20k",
        duration: "12:30",
        category: "mind",
      },
      {
        id: "m3",
        title: "The Confidence Code",
        description: "How MLB players dominate pressure with World Series coach David Franco",
        youtubeId: "Mhi5dfQDiMk",
        duration: "25:20",
        category: "mind",
      },
      {
        id: "m4",
        title: "Narrow Your Focus",
        description: "Mental strength technique to block distractions and slow the game down",
        youtubeId: "vn4T5jwKJXo",
        duration: "8:15",
        category: "mind",
      },
      {
        id: "m5",
        title: "Master the Mental Game",
        description: "Interview with Ken Ravizza, pioneer of mental game training",
        youtubeId: "DLIX63yTckI",
        duration: "32:00",
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
        title: "Character & Long-Term Success",
        description: "Why character matters as much as physical ability for young athletes",
        youtubeId: "VBiYbKlvxWE",
        duration: "24:00",
        category: "spirit",
      },
      {
        id: "s2",
        title: "Build Positive Team Culture",
        description: "Top 5 ways to build trust and create a winning team environment",
        youtubeId: "6yeQYjcdpT4",
        duration: "16:30",
        category: "spirit",
      },
      {
        id: "s3",
        title: "IMG Academy Leadership Class",
        description: "Learn what it takes to become a better leader and teammate",
        youtubeId: "_irjqAmLLso",
        duration: "11:45",
        category: "spirit",
      },
    ],
  },
  {
    id: "zoom",
    name: "Team Meetings",
    description: "Recorded coaching sessions and film study",
    icon: Users,
    color: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/40",
    videos: [
      {
        id: "z1",
        title: "Elite Catcher Training Session",
        description: "Advanced catching drills and techniques breakdown",
        youtubeId: "gjOZJuQUciw",
        duration: "22:00",
        category: "zoom",
      },
      {
        id: "z2",
        title: "Pop Time & Transfer Drills",
        description: "Professional catcher Kyle Schmidt shares receiving techniques",
        youtubeId: "FSJyHemMBfY",
        duration: "18:30",
        category: "zoom",
      },
    ],
  },
];
