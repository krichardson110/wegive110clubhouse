import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { PlayerProgress } from "./usePlayerProgress";

export interface TeamMemberProgress {
  memberId: string;
  userId: string;
  playerName: string;
  role: 'coach' | 'player' | 'parent';
  avatarUrl: string | null;
  displayName: string | null;
  progress: PlayerProgress;
  players?: { id: string; player_name: string }[];
}

export interface TeamProgressData {
  teamId: string;
  teamName: string;
  members: TeamMemberProgress[];
  isCoach: boolean;
}

export const useTeamProgress = () => {
  const { user } = useAuth();

  return useQuery<TeamProgressData[]>({
    queryKey: ["team-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get teams where user is a coach
      const { data: coachTeams, error: teamsError } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .eq("role", "coach");

      if (teamsError) throw teamsError;
      if (!coachTeams?.length) return [];

      const teamIds = coachTeams.map(t => t.team_id);

      // Get team details
      const { data: teams, error: teamDetailsError } = await supabase
        .from("teams")
        .select("id, name")
        .in("id", teamIds);

      if (teamDetailsError) throw teamDetailsError;

      // Get all team members for these teams
      const { data: allMembers, error: membersError } = await supabase
        .from("team_members")
        .select("id, team_id, user_id, role, player_name")
        .in("team_id", teamIds)
        .eq("status", "active");

      if (membersError) throw membersError;

      // Get profiles for all members
      const memberUserIds = [...new Set(allMembers?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", memberUserIds);

      // Get team_member_players for parent accounts
      const memberIds = allMembers?.map(m => m.id) || [];
      const { data: memberPlayers } = await supabase
        .from("team_member_players")
        .select("team_member_id, id, player_name")
        .in("team_member_id", memberIds);

      // Get progress data for all members
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch all progress data in parallel
      const [watchSessions, totalWorkouts, exerciseResponses, chaptersData, activityLogs] = await Promise.all([
        supabase
          .from("video_watch_sessions")
          .select("user_id, workout_id, duration_seconds, started_at")
          .in("user_id", memberUserIds),
        supabase
          .from("workouts")
          .select("id", { count: "exact" })
          .eq("published", true),
        supabase
          .from("exercise_responses")
          .select("user_id, chapter_id, exercise_id, time_spent_seconds, completed_at")
          .in("user_id", memberUserIds),
        supabase
          .from("chapters")
          .select("id, exercises")
          .eq("published", true),
        supabase
          .from("user_activity_logs")
          .select("user_id, visited_at")
          .in("user_id", memberUserIds)
          .order("visited_at", { ascending: false }),
      ]);

      const totalVideos = totalWorkouts.count || 0;
      const chapters = chaptersData.data || [];
      
      // Count total exercises
      let totalExercises = 0;
      chapters.forEach(chapter => {
        const exercises = chapter.exercises as any[];
        if (Array.isArray(exercises)) {
          totalExercises += exercises.length;
        }
      });

      // Calculate progress for each user
      const userProgressMap = new Map<string, PlayerProgress>();

      for (const userId of memberUserIds) {
        const userSessions = (watchSessions.data || []).filter(s => s.user_id === userId);
        const userResponses = (exerciseResponses.data || []).filter(r => r.user_id === userId);
        const userLogs = (activityLogs.data || []).filter(l => l.user_id === userId);

        // Video progress
        const totalWatchTimeSeconds = userSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
        const uniqueVideosWatched = new Set(userSessions.map(s => s.workout_id)).size;
        const videoCompletionPercent = totalVideos > 0 
          ? Math.round((uniqueVideosWatched / totalVideos) * 100) 
          : 0;
        
        const thisWeekWatchSeconds = userSessions
          .filter(s => new Date(s.started_at) >= weekAgo)
          .reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
        
        const thisMonthWatchSeconds = userSessions
          .filter(s => new Date(s.started_at) >= monthAgo)
          .reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

        // Playbook progress
        const exercisesCompleted = userResponses.length;
        const chaptersWithResponses = new Set(userResponses.map(r => r.chapter_id)).size;
        const playbookCompletionPercent = totalExercises > 0 
          ? Math.round((exercisesCompleted / totalExercises) * 100) 
          : 0;
        const totalTimeSpentOnExercises = userResponses.reduce((acc, r) => acc + (r.time_spent_seconds || 0), 0);

        // Streaks
        const streakData = calculateStreaks(userLogs.map(l => l.visited_at), now);

        // Engagement score
        const overallEngagementScore = calculateEngagementScore({
          videoCompletionPercent,
          playbookCompletionPercent,
          currentStreak: streakData.currentStreak,
          activeDaysThisWeek: streakData.activeDaysThisWeek,
        });

        userProgressMap.set(userId, {
          totalWatchTimeSeconds,
          videosWatched: uniqueVideosWatched,
          totalVideos,
          videoCompletionPercent,
          thisWeekWatchSeconds,
          thisMonthWatchSeconds,
          exercisesCompleted,
          totalExercises,
          chaptersStarted: chaptersWithResponses,
          totalChapters: chapters.length,
          playbookCompletionPercent,
          totalTimeSpentOnExercises,
          ...streakData,
          overallEngagementScore,
        });
      }

      // Build team progress data
      const teamProgressData: TeamProgressData[] = (teams || []).map(team => {
        const teamMembers = (allMembers || []).filter(m => m.team_id === team.id);
        
        const members: TeamMemberProgress[] = teamMembers.map(member => {
          const profile = profiles?.find(p => p.user_id === member.user_id);
          const players = memberPlayers?.filter(p => p.team_member_id === member.id) || [];
          
          // Determine display name
          let playerName = member.player_name || profile?.display_name || 'Unknown';
          if (member.role === 'parent' && players.length > 0) {
            playerName = players.map(p => p.player_name).join(', ');
          }

          return {
            memberId: member.id,
            userId: member.user_id,
            playerName,
            role: member.role as 'coach' | 'player' | 'parent',
            avatarUrl: profile?.avatar_url || null,
            displayName: profile?.display_name || null,
            progress: userProgressMap.get(member.user_id) || getDefaultProgress(totalVideos, totalExercises, chapters.length),
            players: players.length > 0 ? players : undefined,
          };
        });

        // Sort: coaches first, then by engagement score
        members.sort((a, b) => {
          if (a.role === 'coach' && b.role !== 'coach') return -1;
          if (a.role !== 'coach' && b.role === 'coach') return 1;
          return b.progress.overallEngagementScore - a.progress.overallEngagementScore;
        });

        return {
          teamId: team.id,
          teamName: team.name,
          members,
          isCoach: true,
        };
      });

      return teamProgressData;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};

// Check if user is a coach of any team
export const useIsCoach = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-coach", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "coach")
        .eq("status", "active")
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    },
    enabled: !!user?.id,
  });
};

function getDefaultProgress(totalVideos: number, totalExercises: number, totalChapters: number): PlayerProgress {
  return {
    totalWatchTimeSeconds: 0,
    videosWatched: 0,
    totalVideos,
    videoCompletionPercent: 0,
    thisWeekWatchSeconds: 0,
    thisMonthWatchSeconds: 0,
    exercisesCompleted: 0,
    totalExercises,
    chaptersStarted: 0,
    totalChapters,
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

  const uniqueDates = [...new Set(
    timestamps.map(t => new Date(t).toISOString().split('T')[0])
  )].sort().reverse();

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDaysThisWeek: 0, activeDaysThisMonth: 0, lastActiveDate: null };
  }

  const lastActiveDate = uniqueDates[0];
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let currentStreak = 0;
  let checkDate = today;
  
  if (uniqueDates.includes(today)) {
    currentStreak = 1;
    checkDate = yesterday;
  } else if (uniqueDates.includes(yesterday)) {
    currentStreak = 1;
    checkDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
  
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
  
  const videoScore = videoCompletionPercent * 0.3;
  const playbookScore = playbookCompletionPercent * 0.3;
  const streakScore = Math.min(currentStreak / 30, 1) * 100 * 0.2;
  const weeklyScore = (activeDaysThisWeek / 7) * 100 * 0.2;
  
  return Math.round(videoScore + playbookScore + streakScore + weeklyScore);
}
