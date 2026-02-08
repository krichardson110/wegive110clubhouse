import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PlayerProgress {
  // Video/Workout Progress
  totalWatchTimeSeconds: number;
  videosWatched: number;
  totalVideos: number;
  videoCompletionPercent: number;
  thisWeekWatchSeconds: number;
  thisMonthWatchSeconds: number;
  
  // Playbook Progress
  exercisesCompleted: number;
  totalExercises: number;
  chaptersStarted: number;
  totalChapters: number;
  playbookCompletionPercent: number;
  totalTimeSpentOnExercises: number;
  
  // Activity Streaks
  currentStreak: number;
  longestStreak: number;
  activeDaysThisWeek: number;
  activeDaysThisMonth: number;
  lastActiveDate: string | null;
  
  // Overall Score
  overallEngagementScore: number;
}

export const usePlayerProgress = () => {
  const { user } = useAuth();

  return useQuery<PlayerProgress>({
    queryKey: ["player-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return getDefaultProgress();
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch all data in parallel
      const [
        watchSessions,
        totalWorkouts,
        exerciseResponses,
        chaptersData,
        activityLogs,
      ] = await Promise.all([
        // Video watch sessions
        supabase
          .from("video_watch_sessions")
          .select("workout_id, duration_seconds, started_at")
          .eq("user_id", user.id),
        
        // Total available workouts
        supabase
          .from("workouts")
          .select("id", { count: "exact" })
          .eq("published", true),
        
        // Exercise responses
        supabase
          .from("exercise_responses")
          .select("chapter_id, exercise_id, time_spent_seconds, completed_at")
          .eq("user_id", user.id),
        
        // Published chapters with exercises
        supabase
          .from("chapters")
          .select("id, exercises")
          .eq("published", true),
        
        // Activity logs for streak calculation
        supabase
          .from("user_activity_logs")
          .select("visited_at")
          .eq("user_id", user.id)
          .order("visited_at", { ascending: false }),
      ]);

      // Process video progress
      const sessions = watchSessions.data || [];
      const totalWatchTimeSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      const uniqueVideosWatched = new Set(sessions.map(s => s.workout_id)).size;
      const totalVideos = totalWorkouts.count || 0;
      const videoCompletionPercent = totalVideos > 0 
        ? Math.round((uniqueVideosWatched / totalVideos) * 100) 
        : 0;
      
      const thisWeekWatchSeconds = sessions
        .filter(s => new Date(s.started_at) >= weekAgo)
        .reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      
      const thisMonthWatchSeconds = sessions
        .filter(s => new Date(s.started_at) >= monthAgo)
        .reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

      // Process playbook progress
      const responses = exerciseResponses.data || [];
      const chapters = chaptersData.data || [];
      
      // Count total exercises across all chapters
      let totalExercises = 0;
      chapters.forEach(chapter => {
        const exercises = chapter.exercises as any[];
        if (Array.isArray(exercises)) {
          totalExercises += exercises.length;
        }
      });
      
      const exercisesCompleted = responses.length;
      const chaptersWithResponses = new Set(responses.map(r => r.chapter_id)).size;
      const totalChapters = chapters.length;
      const playbookCompletionPercent = totalExercises > 0 
        ? Math.round((exercisesCompleted / totalExercises) * 100) 
        : 0;
      const totalTimeSpentOnExercises = responses.reduce((acc, r) => acc + (r.time_spent_seconds || 0), 0);

      // Calculate streaks from activity logs
      const logs = activityLogs.data || [];
      const { currentStreak, longestStreak, activeDaysThisWeek, activeDaysThisMonth, lastActiveDate } = 
        calculateStreaks(logs.map(l => l.visited_at), now);

      // Calculate overall engagement score (0-100)
      const overallEngagementScore = calculateEngagementScore({
        videoCompletionPercent,
        playbookCompletionPercent,
        currentStreak,
        activeDaysThisWeek,
      });

      return {
        totalWatchTimeSeconds,
        videosWatched: uniqueVideosWatched,
        totalVideos,
        videoCompletionPercent,
        thisWeekWatchSeconds,
        thisMonthWatchSeconds,
        exercisesCompleted,
        totalExercises,
        chaptersStarted: chaptersWithResponses,
        totalChapters,
        playbookCompletionPercent,
        totalTimeSpentOnExercises,
        currentStreak,
        longestStreak,
        activeDaysThisWeek,
        activeDaysThisMonth,
        lastActiveDate,
        overallEngagementScore,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

function getDefaultProgress(): PlayerProgress {
  return {
    totalWatchTimeSeconds: 0,
    videosWatched: 0,
    totalVideos: 0,
    videoCompletionPercent: 0,
    thisWeekWatchSeconds: 0,
    thisMonthWatchSeconds: 0,
    exercisesCompleted: 0,
    totalExercises: 0,
    chaptersStarted: 0,
    totalChapters: 0,
    playbookCompletionPercent: 0,
    totalTimeSpentOnExercises: 0,
    currentStreak: 0,
    longestStreak: 0,
    activeDaysThisWeek: 0,
    activeDaysThisMonth: 0,
    lastActiveDate: null,
    overallEngagementScore: 0,
  };
}

function calculateStreaks(
  timestamps: string[], 
  now: Date
): { 
  currentStreak: number; 
  longestStreak: number; 
  activeDaysThisWeek: number; 
  activeDaysThisMonth: number;
  lastActiveDate: string | null;
} {
  if (timestamps.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDaysThisWeek: 0, activeDaysThisMonth: 0, lastActiveDate: null };
  }

  // Get unique dates (normalize to date strings)
  const uniqueDates = [...new Set(
    timestamps.map(t => new Date(t).toISOString().split('T')[0])
  )].sort().reverse();

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDaysThisWeek: 0, activeDaysThisMonth: 0, lastActiveDate: null };
  }

  const lastActiveDate = uniqueDates[0];
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Calculate current streak
  let currentStreak = 0;
  let checkDate = today;
  
  // Start from today or yesterday
  if (uniqueDates.includes(today)) {
    currentStreak = 1;
    checkDate = yesterday;
  } else if (uniqueDates.includes(yesterday)) {
    currentStreak = 1;
    checkDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  } else {
    // Streak broken
    currentStreak = 0;
  }
  
  // Count consecutive days backwards
  if (currentStreak > 0) {
    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates.includes(checkDate)) {
        currentStreak++;
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toISOString().split('T')[0];
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDates = [...uniqueDates].sort();
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  // Calculate active days this week and month
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const activeDaysThisWeek = uniqueDates.filter(d => d >= weekAgo).length;
  const activeDaysThisMonth = uniqueDates.filter(d => d >= monthAgo).length;

  return { currentStreak, longestStreak, activeDaysThisWeek, activeDaysThisMonth, lastActiveDate };
}

function calculateEngagementScore(params: {
  videoCompletionPercent: number;
  playbookCompletionPercent: number;
  currentStreak: number;
  activeDaysThisWeek: number;
}): number {
  const { videoCompletionPercent, playbookCompletionPercent, currentStreak, activeDaysThisWeek } = params;
  
  // Weighted scoring:
  // 30% video completion
  // 30% playbook completion  
  // 20% current streak (max 30 days = 100%)
  // 20% weekly activity (7 days = 100%)
  
  const videoScore = videoCompletionPercent * 0.3;
  const playbookScore = playbookCompletionPercent * 0.3;
  const streakScore = Math.min(currentStreak / 30, 1) * 100 * 0.2;
  const weeklyScore = (activeDaysThisWeek / 7) * 100 * 0.2;
  
  return Math.round(videoScore + playbookScore + streakScore + weeklyScore);
}

// Utility to format time
export const formatProgressTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
