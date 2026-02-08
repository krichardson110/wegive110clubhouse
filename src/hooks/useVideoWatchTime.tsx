import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRef, useCallback, useEffect } from "react";

interface WatchMetrics {
  totalWatchTimeSeconds: number;
  totalSessions: number;
  videosWatched: number;
  thisWeekSeconds: number;
  thisMonthSeconds: number;
}

export const useVideoWatchTime = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery<WatchMetrics>({
    queryKey: ["video-watch-metrics", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalWatchTimeSeconds: 0,
          totalSessions: 0,
          videosWatched: 0,
          thisWeekSeconds: 0,
          thisMonthSeconds: 0,
        };
      }

      const { data, error } = await supabase
        .from("video_watch_sessions")
        .select("workout_id, duration_seconds, started_at")
        .eq("user_id", user.id);

      if (error) throw error;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalWatchTimeSeconds = data.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      const uniqueWorkouts = new Set(data.map(s => s.workout_id));
      
      const thisWeekSeconds = data
        .filter(s => new Date(s.started_at) >= weekAgo)
        .reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      
      const thisMonthSeconds = data
        .filter(s => new Date(s.started_at) >= monthAgo)
        .reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

      return {
        totalWatchTimeSeconds,
        totalSessions: data.length,
        videosWatched: uniqueWorkouts.size,
        thisWeekSeconds,
        thisMonthSeconds,
      };
    },
    enabled: !!user?.id,
  });

  return {
    metrics: metrics || {
      totalWatchTimeSeconds: 0,
      totalSessions: 0,
      videosWatched: 0,
      thisWeekSeconds: 0,
      thisMonthSeconds: 0,
    },
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["video-watch-metrics"] }),
  };
};

// Hook for tracking individual video sessions
export const useVideoWatchSession = (workoutId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef<boolean>(false);

  const startSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from("video_watch_sessions")
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          duration_seconds: 0,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ sessionId, durationSeconds }: { sessionId: string; durationSeconds: number }) => {
      const { error } = await supabase
        .from("video_watch_sessions")
        .update({
          duration_seconds: durationSeconds,
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-watch-metrics"] });
    },
  });

  const startTracking = useCallback(async () => {
    // Prevent duplicate sessions
    if (!user?.id || isTrackingRef.current || sessionIdRef.current) return;
    
    isTrackingRef.current = true;
    
    try {
      const sessionId = await startSession.mutateAsync();
      sessionIdRef.current = sessionId;
      startTimeRef.current = Date.now();
      
      // Update every 10 seconds while watching
      intervalIdRef.current = setInterval(() => {
        if (sessionIdRef.current && startTimeRef.current) {
          const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          updateSession.mutate({
            sessionId: sessionIdRef.current,
            durationSeconds,
          });
        }
      }, 10000);
    } catch (error) {
      console.error("Failed to start watch session:", error);
      isTrackingRef.current = false;
    }
  }, [user?.id, workoutId]);

  const stopTracking = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    if (sessionIdRef.current && startTimeRef.current) {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (durationSeconds > 0) {
        updateSession.mutate({
          sessionId: sessionIdRef.current,
          durationSeconds,
        });
      }
      sessionIdRef.current = null;
      startTimeRef.current = 0;
    }
    
    isTrackingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      // Final save on unmount
      if (sessionIdRef.current && startTimeRef.current) {
        const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (durationSeconds > 0) {
          // Fire and forget - component is unmounting
          supabase
            .from("video_watch_sessions")
            .update({
              duration_seconds: durationSeconds,
              ended_at: new Date().toISOString(),
            })
            .eq("id", sessionIdRef.current)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["video-watch-metrics"] });
            });
        }
      }
    };
  }, [queryClient]);

  return {
    startTracking,
    stopTracking,
  };
};

// Utility function to format seconds into readable time
export const formatWatchTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};
