import { Flame, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  activeDaysThisWeek: number;
  className?: string;
}

const StreakDisplay = ({ 
  currentStreak, 
  longestStreak, 
  activeDaysThisWeek,
  className 
}: StreakDisplayProps) => {
  // Generate week dots (Mon-Sun)
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Streak */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          currentStreak > 0 
            ? "bg-gradient-to-br from-orange-500/20 to-red-500/20" 
            : "bg-muted/20"
        )}>
          <Flame className={cn(
            "w-8 h-8",
            currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">
            {currentStreak} <span className="text-lg font-normal text-muted-foreground">days</span>
          </p>
          <p className="text-sm text-muted-foreground">Current Streak</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-muted-foreground">
            Best: <span className="text-foreground font-medium">{longestStreak} days</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            This week: <span className="text-foreground font-medium">{activeDaysThisWeek}/7</span>
          </span>
        </div>
      </div>

      {/* Week Activity Dots */}
      <div className="flex gap-2">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
              i < activeDaysThisWeek 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted/30 text-muted-foreground"
            )}>
              {day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakDisplay;
