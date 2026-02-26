import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Map of route paths to human-readable page names
const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/landing': 'Landing Page',
  '/workouts': 'Workouts',
  '/videos': 'Videos',
  '/playbook': 'Playbook',
  '/schedule': 'Schedule',
  '/return-report': 'Return Report',
  '/community': 'Clubhouse',
  '/community/badges': 'Badges',
  '/teams': 'My Teams',
  '/profile': 'Profile',
  '/auth': 'Authentication',
};

const getPageTitle = (pathname: string): string => {
  // Check exact match first
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }
  
  // Check for team page
  if (pathname.startsWith('/teams/') && pathname !== '/teams/join') {
    return 'Team Page';
  }
  
  if (pathname === '/teams/join') {
    return 'Join Team';
  }
  
  // Check for admin pages
  if (pathname.includes('/admin')) {
    return 'Admin';
  }
  
  return pathname.slice(1) || 'Unknown';
};

export const useActivityTracker = () => {
  const location = useLocation();
  const { user } = useAuth();
  const activityIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!user) return;

    const recordPageVisit = async () => {
      // Update previous activity with time spent before creating new one
      if (activityIdRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        try {
          await supabase
            .from('user_activity_logs')
            .update({
              time_spent_seconds: timeSpent,
              left_at: new Date().toISOString(),
            })
            .eq('id', activityIdRef.current);
        } catch (error) {
          console.error('Error updating activity:', error);
        }
      }

      // Reset start time for new page
      startTimeRef.current = Date.now();

      // Don't track admin pages for regular users or auth page
      if (location.pathname.includes('/admin') || location.pathname === '/auth' || location.pathname === '/landing') {
        activityIdRef.current = null;
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_activity_logs')
          .insert({
            user_id: user.id,
            page_path: location.pathname,
            page_title: getPageTitle(location.pathname),
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error recording activity:', error);
          return;
        }

        activityIdRef.current = data.id;
      } catch (error) {
        console.error('Error recording page visit:', error);
      }
    };

    recordPageVisit();

    // Update time spent when leaving
    return () => {
      if (activityIdRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const currentActivityId = activityIdRef.current;
        // Fire and forget - don't wait for completion
        (async () => {
          try {
            await supabase
              .from('user_activity_logs')
              .update({
                time_spent_seconds: timeSpent,
                left_at: new Date().toISOString(),
              })
              .eq('id', currentActivityId);
          } catch {
            // Silently ignore errors on cleanup
          }
        })();
      }
    };
  }, [location.pathname, user]);

  // Also update on page unload using visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && activityIdRef.current && user) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const currentActivityId = activityIdRef.current;
        // Fire and forget update via supabase client
        supabase
          .from('user_activity_logs')
          .update({
            time_spent_seconds: timeSpent,
            left_at: new Date().toISOString(),
          })
          .eq('id', currentActivityId)
          .then(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);
};

export default useActivityTracker;
