import { BookOpen, Target, Users, Shield, Flame, Star, Heart, Lightbulb } from "lucide-react";

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: "reflection" | "action" | "discussion" | "journaling";
  timeEstimate: string;
}

export interface ReadingMaterial {
  id: string;
  title: string;
  author?: string;
  description: string;
  type: "article" | "quote" | "story" | "excerpt";
  content: string;
  source?: string;
}

export interface PlaybookChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  keyTakeaways: string[];
  readings: ReadingMaterial[];
  exercises: Exercise[];
}

export const playbookChapters: PlaybookChapter[] = [
  {
    id: "character",
    number: 1,
    title: "Character First",
    subtitle: "The Foundation of Leadership",
    description: "True leadership starts with who you are, not what you do. Build a foundation of integrity, honesty, and accountability.",
    icon: Shield,
    color: "from-primary/20 to-clubhouse-purple-light/20 border-primary/40",
    keyTakeaways: [
      "Your character is your reputation in action",
      "Do the right thing even when no one is watching",
      "Mistakes don't define you - how you respond does",
      "Accountability starts with ownership"
    ],
    readings: [
      {
        id: "c1-r1",
        title: "The Iceberg of Character",
        type: "article",
        description: "What people see is only the tip of the iceberg",
        content: "People see your performance, your results, your wins and losses. But underneath the surface lies your character - the foundation that holds everything up. Your habits, your discipline, your attitude, your work ethic. These unseen elements determine your visible success. Champions aren't made in the spotlight; they're made in the dark, early morning hours when no one is watching.",
      },
      {
        id: "c1-r2",
        title: "Words to Live By",
        author: "John Wooden",
        type: "quote",
        description: "Legendary coach on character",
        content: "\"Be more concerned with your character than your reputation, because your character is what you really are, while your reputation is merely what others think you are.\"",
        source: "John Wooden, UCLA Basketball Coach"
      }
    ],
    exercises: [
      {
        id: "c1-e1",
        title: "Personal Values Inventory",
        description: "List your top 5 core values. For each value, write one specific way you demonstrated it this week and one way you fell short.",
        type: "journaling",
        timeEstimate: "15 min"
      },
      {
        id: "c1-e2",
        title: "Accountability Partner",
        description: "Identify a teammate to be your accountability partner. Share one goal with them and ask them to check in on your progress weekly.",
        type: "action",
        timeEstimate: "10 min"
      }
    ]
  },
  {
    id: "teamwork",
    number: 2,
    title: "Team Over Self",
    subtitle: "The Power of We",
    description: "Individual talent wins games, but teamwork wins championships. Learn to put the team's success above personal glory.",
    icon: Users,
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/40",
    keyTakeaways: [
      "The best ability is availability - show up for your team",
      "Celebrate teammates' success as your own",
      "Fill the role your team needs, not the one you want",
      "Communication builds trust"
    ],
    readings: [
      {
        id: "t1-r1",
        title: "The Starfish and the Spider",
        type: "story",
        description: "Why decentralized teams outperform",
        content: "A spider has a centralized brain - cut off its head and it dies. A starfish has no brain - cut off a leg and it grows back; cut it in half and you have two starfish. The best teams operate like starfish: every player is empowered to lead, every player takes ownership, and the whole is greater than the sum of its parts. When one player is down, others step up. There's no single point of failure.",
      },
      {
        id: "t1-r2",
        title: "The Ultimate Teammate",
        author: "Derek Jeter",
        type: "quote",
        description: "On being a great teammate",
        content: "\"There may be people who have more talent than you, but there's no excuse for anyone to work harder than you do.\"",
        source: "Derek Jeter, New York Yankees Captain"
      }
    ],
    exercises: [
      {
        id: "t1-e1",
        title: "Teammate Appreciation",
        description: "Write a note to a teammate recognizing something specific they did that helped the team. Be genuine and specific about the impact.",
        type: "action",
        timeEstimate: "10 min"
      },
      {
        id: "t1-e2",
        title: "Team Discussion: Our Culture",
        description: "As a team, discuss: What three words describe who we want to be? How do we hold each other accountable to these standards?",
        type: "discussion",
        timeEstimate: "20 min"
      }
    ]
  },
  {
    id: "discipline",
    number: 3,
    title: "Discipline Daily",
    subtitle: "Winning the Day",
    description: "Excellence is not an act but a habit. Build the daily disciplines that compound into extraordinary results.",
    icon: Target,
    color: "from-accent/20 to-clubhouse-orange-light/20 border-accent/40",
    keyTakeaways: [
      "Win the morning, win the day",
      "Small disciplines compound into big results",
      "Your habits predict your future",
      "Consistency beats intensity"
    ],
    readings: [
      {
        id: "d1-r1",
        title: "The Compound Effect",
        type: "article",
        description: "How small actions create massive results",
        content: "Imagine two players. Player A does 10 extra swings after practice every day. Player B skips them. After one day, no difference. After one week, barely noticeable. After one month, Player A has taken 300 more swings. After one season? Player A has taken 1,800 more swings than Player B. That's the compound effect. Small, seemingly insignificant actions, repeated consistently, create extraordinary differences. The question isn't whether you can do it today - it's whether you'll do it every day.",
      },
      {
        id: "d1-r2",
        title: "On Excellence",
        author: "Aristotle",
        type: "quote",
        description: "The ancient wisdom on habits",
        content: "\"We are what we repeatedly do. Excellence, then, is not an act, but a habit.\"",
        source: "Aristotle, Greek Philosopher"
      }
    ],
    exercises: [
      {
        id: "d1-e1",
        title: "Morning Routine Design",
        description: "Design a 30-minute morning routine that sets you up for success. Include physical, mental, and preparation elements. Try it for 7 days.",
        type: "action",
        timeEstimate: "15 min"
      },
      {
        id: "d1-e2",
        title: "Habit Tracker",
        description: "Choose 3 daily habits critical to your development. Track them for 21 days. Reflect on what you learned about yourself.",
        type: "journaling",
        timeEstimate: "5 min daily"
      }
    ]
  },
  {
    id: "adversity",
    number: 4,
    title: "Embrace Adversity",
    subtitle: "Growth Through Struggle",
    description: "Adversity is not an obstacle but an opportunity. Learn to use setbacks as setups for comebacks.",
    icon: Flame,
    color: "from-red-500/20 to-red-600/20 border-red-500/40",
    keyTakeaways: [
      "Failure is not the opposite of success - it's part of it",
      "Your response to adversity defines your character",
      "Pressure is a privilege",
      "Comfort zones are where dreams go to die"
    ],
    readings: [
      {
        id: "a1-r1",
        title: "The 0-4 Game",
        type: "story",
        description: "How champions respond to failure",
        content: "Every great hitter has had an 0-4 game. The difference between a career .200 hitter and a .300 hitter? How they respond the next day. The .200 hitter dwells, doubts, changes their approach. The .300 hitter reviews the film, makes adjustments, and shows up ready to compete again. Baseball is a game of failure - even the best fail 7 out of 10 times. Your ability to flush failures and compete in the next at-bat is what separates good from great.",
      },
      {
        id: "a1-r2",
        title: "The Obstacle",
        author: "Marcus Aurelius",
        type: "quote",
        description: "Stoic wisdom on adversity",
        content: "\"The impediment to action advances action. What stands in the way becomes the way.\"",
        source: "Marcus Aurelius, Roman Emperor"
      }
    ],
    exercises: [
      {
        id: "a1-e1",
        title: "Failure Reframe",
        description: "Write about a recent failure or setback. What did it teach you? How did it make you stronger? What will you do differently?",
        type: "reflection",
        timeEstimate: "15 min"
      },
      {
        id: "a1-e2",
        title: "Comfort Zone Challenge",
        description: "Identify something outside your comfort zone related to baseball or life. Commit to doing it this week. Journal about the experience.",
        type: "action",
        timeEstimate: "Varies"
      }
    ]
  },
  {
    id: "purpose",
    number: 5,
    title: "Find Your Why",
    subtitle: "Purpose-Driven Performance",
    description: "When you know your 'why', the 'how' becomes easier. Connect your daily grind to a greater purpose.",
    icon: Star,
    color: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/40",
    keyTakeaways: [
      "Purpose provides fuel when motivation fades",
      "Play for something bigger than yourself",
      "Your 'why' must be stronger than your excuses",
      "Legacy is built in moments, not just achievements"
    ],
    readings: [
      {
        id: "p1-r1",
        title: "Playing for Something Bigger",
        type: "article",
        description: "Finding meaning beyond personal success",
        content: "The players who perform best under pressure are those who play for something beyond themselves. They play for their family. For their teammates. For the name on the front of the jersey. For the kids watching who dream of being in their shoes. When you connect your performance to a purpose larger than personal achievement, pressure becomes fuel instead of weight. Find your 'why' and let it drive every rep, every at-bat, every pitch.",
      },
      {
        id: "p1-r2",
        title: "The Question",
        author: "Simon Sinek",
        type: "quote",
        description: "Start with why",
        content: "\"People don't buy what you do; they buy why you do it. And what you do simply proves what you believe.\"",
        source: "Simon Sinek, Author of 'Start With Why'"
      }
    ],
    exercises: [
      {
        id: "p1-e1",
        title: "Define Your Why",
        description: "Answer these questions: Why do you play baseball? Who are you playing for? What legacy do you want to leave?",
        type: "reflection",
        timeEstimate: "20 min"
      },
      {
        id: "p1-e2",
        title: "Purpose Statement",
        description: "Write a personal purpose statement in one sentence. Put it somewhere you'll see it daily (locker, phone wallpaper, mirror).",
        type: "journaling",
        timeEstimate: "15 min"
      }
    ]
  },
  {
    id: "gratitude",
    number: 6,
    title: "Attitude of Gratitude",
    subtitle: "The Mindset Multiplier",
    description: "Gratitude shifts your focus from what you lack to what you have. It's the foundation of a positive, resilient mindset.",
    icon: Heart,
    color: "from-pink-500/20 to-pink-600/20 border-pink-500/40",
    keyTakeaways: [
      "Gratitude and negativity cannot coexist",
      "Appreciate the opportunity to compete",
      "Thank those who invest in your development",
      "A grateful heart is a magnet for abundance"
    ],
    readings: [
      {
        id: "g1-r1",
        title: "The Gift of the Game",
        type: "article",
        description: "Appreciating the opportunity to play",
        content: "There will come a day when you put on your cleats for the last time. You won't know it's the last time until it's over. Right now, you have something millions of people would trade anything for: the chance to compete, to improve, to be part of a team. Don't waste a single rep. Don't take a single practice for granted. Play with the joy and energy of someone who knows this gift is temporary. Because it is.",
      },
      {
        id: "g1-r2",
        title: "The Power of Appreciation",
        author: "Lou Gehrig",
        type: "quote",
        description: "The luckiest man speech",
        content: "\"Today, I consider myself the luckiest man on the face of the earth.\"",
        source: "Lou Gehrig, farewell speech at Yankee Stadium, 1939"
      }
    ],
    exercises: [
      {
        id: "g1-e1",
        title: "Daily Gratitude",
        description: "For the next week, write down 3 things you're grateful for each morning before practice. Notice how it affects your attitude.",
        type: "journaling",
        timeEstimate: "5 min daily"
      },
      {
        id: "g1-e2",
        title: "Thank You Letter",
        description: "Write a letter to someone who has impacted your baseball journey (coach, parent, teammate). Tell them specifically what they mean to you.",
        type: "action",
        timeEstimate: "20 min"
      }
    ]
  },
  {
    id: "leadership",
    number: 7,
    title: "Lead by Example",
    subtitle: "Actions Over Words",
    description: "The best leaders don't demand respect - they earn it through consistent actions. Your behavior sets the standard.",
    icon: Lightbulb,
    color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/40",
    keyTakeaways: [
      "Your teammates are watching how you respond",
      "Be the hardest worker in the room",
      "Leaders serve the team, not themselves",
      "Energy is contagious - bring the right kind"
    ],
    readings: [
      {
        id: "l1-r1",
        title: "The First One In",
        type: "story",
        description: "Setting the standard through work",
        content: "The captain arrived at the field 30 minutes before anyone else. He stretched, did his throwing routine, and got his work in before practice even started. He never announced it or asked for recognition. But his teammates noticed. One by one, they started showing up earlier. The standard rose, not because of speeches or rules, but because of example. Leadership isn't a title you're given - it's a behavior you demonstrate every single day.",
      },
      {
        id: "l1-r2",
        title: "True Leadership",
        author: "Jocko Willink",
        type: "quote",
        description: "Extreme ownership",
        content: "\"It's not what you preach, it's what you tolerate.\"",
        source: "Jocko Willink, Navy SEAL Commander"
      }
    ],
    exercises: [
      {
        id: "l1-e1",
        title: "Leadership Audit",
        description: "Rate yourself 1-10 on: Work ethic, Attitude, Communication, Reliability, Selflessness. Identify your biggest growth area.",
        type: "reflection",
        timeEstimate: "15 min"
      },
      {
        id: "l1-e2",
        title: "Lead First",
        description: "This week, be the first to do something difficult: first to volunteer, first to encourage, first to arrive. Document how it felt.",
        type: "action",
        timeEstimate: "Throughout week"
      }
    ]
  }
];
