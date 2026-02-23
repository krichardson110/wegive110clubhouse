import { AlertTriangle, Flame, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDailyCheckins, usePlayerStreak } from "@/hooks/useDrive5";

interface StreakWarningProps {
  teamId?: string;
  onNavigate?: () => void;
}

const StreakWarning = ({ teamId, onNavigate }: StreakWarningProps) => {
  const { user } = useAuth();
  const { data: checkins = [] } = useDailyCheckins(undefined, teamId);
  const { data: streak } = usePlayerStreak(teamId);

  // Only show if user has an active streak but hasn't checked in today
  const hasActiveStreak = streak && streak.current_streak > 0;
  const hasCheckedInToday = checkins.some(c => c.completed);

  if (!user || !hasActiveStreak || hasCheckedInToday) return null;

  return (
    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex items-center gap-3 animate-pulse">
      <div className="p-2 rounded-full bg-accent/20">
        <AlertTriangle className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-accent">
          <Flame className="w-4 h-4 inline mr-1" />
          Your {streak.current_streak}-day streak is at risk!
        </p>
        <p className="text-sm text-muted-foreground">
          Complete at least one check-in today to keep your streak alive.
        </p>
      </div>
      {onNavigate && (
        <button
          onClick={onNavigate}
          className="shrink-0 text-accent hover:text-accent/80 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default StreakWarning;
