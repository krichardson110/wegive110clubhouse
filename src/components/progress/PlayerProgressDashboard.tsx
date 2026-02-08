import { usePlayerProgress, formatProgressTime } from "@/hooks/usePlayerProgress";
import ProgressRing from "./ProgressRing";
import StreakDisplay from "./StreakDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dumbbell, 
  BookOpen, 
  Clock, 
  Video, 
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerProgressDashboardProps {
  className?: string;
  compact?: boolean;
}

const PlayerProgressDashboard = ({ className, compact = false }: PlayerProgressDashboardProps) => {
  const { data: progress, isLoading } = usePlayerProgress();

  if (isLoading) {
    return <ProgressSkeleton compact={compact} />;
  }

  if (!progress) return null;

  if (compact) {
    return <CompactProgress progress={progress} className={className} />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Engagement Score */}
      <Card className="glass-card border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ProgressRing 
              progress={progress.overallEngagementScore} 
              size={140}
              strokeWidth={10}
              color="primary"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {progress.overallEngagementScore}
                </p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </ProgressRing>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your Progress
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Keep training and completing exercises to boost your score!
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <StatBadge 
                  icon={Zap} 
                  label="Streak" 
                  value={`${progress.currentStreak} days`}
                  active={progress.currentStreak > 0}
                />
                <StatBadge 
                  icon={Video} 
                  label="Videos" 
                  value={`${progress.videosWatched}/${progress.totalVideos}`}
                />
                <StatBadge 
                  icon={BookOpen} 
                  label="Exercises" 
                  value={`${progress.exercisesCompleted}/${progress.totalExercises}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Workout Progress */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ProgressRing 
                progress={progress.videoCompletionPercent} 
                size={80}
                strokeWidth={6}
                color="accent"
              >
                <span className="text-lg font-bold">{progress.videoCompletionPercent}%</span>
              </ProgressRing>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {progress.videosWatched}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {progress.totalVideos} videos watched
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatProgressTime(progress.totalWatchTimeSeconds)} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Playbook Progress */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Playbook Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ProgressRing 
                progress={progress.playbookCompletionPercent} 
                size={80}
                strokeWidth={6}
                color="success"
              >
                <span className="text-lg font-bold">{progress.playbookCompletionPercent}%</span>
              </ProgressRing>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {progress.exercisesCompleted}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {progress.totalExercises} exercises done
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {progress.chaptersStarted}/{progress.totalChapters} chapters started
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Watch Time</span>
                <span className="font-medium">{formatProgressTime(progress.thisWeekWatchSeconds)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Days</span>
                <span className="font-medium">{progress.activeDaysThisWeek}/7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Exercise Time</span>
                <span className="font-medium">{formatProgressTime(progress.totalTimeSpentOnExercises)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Activity Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <StreakDisplay 
            currentStreak={progress.currentStreak}
            longestStreak={progress.longestStreak}
            activeDaysThisWeek={progress.activeDaysThisWeek}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Compact version for sidebar or smaller spaces
const CompactProgress = ({ progress, className }: { progress: any; className?: string }) => (
  <Card className={cn("glass-card", className)}>
    <CardContent className="pt-4">
      <div className="flex items-center gap-4">
        <ProgressRing 
          progress={progress.overallEngagementScore} 
          size={60}
          strokeWidth={5}
          color="primary"
        >
          <span className="text-sm font-bold">{progress.overallEngagementScore}</span>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">Your Progress</p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{progress.currentStreak}🔥</span>
            <span>{progress.videosWatched} videos</span>
            <span>{progress.exercisesCompleted} exercises</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Stat badge component
const StatBadge = ({ 
  icon: Icon, 
  label, 
  value, 
  active = true 
}: { 
  icon: any; 
  label: string; 
  value: string;
  active?: boolean;
}) => (
  <div className={cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
    active ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground"
  )}>
    <Icon className="w-4 h-4" />
    <span className="font-medium">{value}</span>
  </div>
);

// Loading skeleton
const ProgressSkeleton = ({ compact }: { compact: boolean }) => {
  if (compact) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-[60px] h-[60px] rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-[140px] h-[140px] rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass-card">
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlayerProgressDashboard;
