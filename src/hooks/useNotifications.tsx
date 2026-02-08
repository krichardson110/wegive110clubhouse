import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationType = "game" | "post" | "achievement" | "reminder";

export interface NotificationPreferences {
  games: boolean;
  posts: boolean;
  achievements: boolean;
  reminders: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  games: true,
  posts: true,
  achievements: true,
  reminders: true,
};

const PREFERENCES_KEY = "notification_preferences";

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  // Check if notifications are supported
  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }

    // Load saved preferences
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notification preferences");
      }
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("Notifications are not supported on this device");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Notifications enabled! You'll receive updates about games, posts, and achievements.");
        return true;
      } else if (result === "denied") {
        toast.error("Notifications blocked. You can enable them in your browser settings.");
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to request notification permission");
      return false;
    }
  }, [isSupported]);

  // Update preferences
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Send a notification
  const sendNotification = useCallback(async (
    type: NotificationType,
    title: string,
    body: string,
    data?: { url?: string; tag?: string }
  ) => {
    // Check if permission granted and type is enabled
    if (permission !== "granted") return false;
    
    const typeEnabled = preferences[type === "game" ? "games" : 
                                    type === "post" ? "posts" : 
                                    type === "achievement" ? "achievements" : "reminders"];
    if (!typeEnabled) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: data?.tag || `${type}-${Date.now()}`,
        data: {
          url: data?.url || "/",
          type,
        },
        requireInteraction: type === "game", // Games stay until dismissed
      });
      
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  }, [permission, preferences]);

  // Subscribe to upcoming games
  const subscribeToGameReminders = useCallback(() => {
    if (!user?.id || permission !== "granted" || !preferences.games) return;

    // Check for games in the next 24 hours every hour
    const checkUpcomingGames = async () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const { data: events } = await supabase
        .from("schedule_events")
        .select("*")
        .eq("event_type", "game")
        .eq("published", true)
        .gte("event_date", now.toISOString().split('T')[0])
        .lte("event_date", tomorrow.toISOString().split('T')[0]);

      if (events?.length) {
        const nextGame = events[0];
        const gameTime = new Date(`${nextGame.event_date}T${nextGame.event_time}`);
        const hoursUntil = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Send reminder 2 hours before
        if (hoursUntil <= 2 && hoursUntil > 1.5) {
          sendNotification(
            "game",
            "Game Day! 🏆",
            `${nextGame.title} starts in 2 hours at ${nextGame.location || 'TBD'}`,
            { url: "/schedule", tag: `game-${nextGame.id}` }
          );
        }
      }
    };

    // Check immediately and then every hour
    checkUpcomingGames();
    const interval = setInterval(checkUpcomingGames, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id, permission, preferences.games, sendNotification]);

  return {
    isSupported,
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    sendNotification,
    subscribeToGameReminders,
    isEnabled: permission === "granted",
  };
};

// Hook for sending achievement notifications
export const useAchievementNotifications = () => {
  const { sendNotification, isEnabled, preferences } = useNotifications();

  const notifyBadgeEarned = useCallback((badgeName: string) => {
    if (!isEnabled || !preferences.achievements) return;
    
    sendNotification(
      "achievement",
      "New Badge Earned! 🏅",
      `Congratulations! You've earned the "${badgeName}" badge!`,
      { url: "/profile", tag: `badge-${badgeName}` }
    );
  }, [sendNotification, isEnabled, preferences.achievements]);

  const notifyStreakMilestone = useCallback((days: number) => {
    if (!isEnabled || !preferences.achievements) return;
    
    sendNotification(
      "achievement",
      `${days}-Day Streak! 🔥`,
      `Amazing! You've been active for ${days} days in a row. Keep it going!`,
      { url: "/progress", tag: `streak-${days}` }
    );
  }, [sendNotification, isEnabled, preferences.achievements]);

  const notifyCompletionMilestone = useCallback((type: "video" | "playbook", percent: number) => {
    if (!isEnabled || !preferences.achievements) return;
    
    const title = percent === 100 
      ? `${type === "video" ? "Videos" : "Playbook"} Complete! 🎉`
      : `${percent}% ${type === "video" ? "Videos" : "Playbook"} Complete!`;
    
    sendNotification(
      "achievement",
      title,
      percent === 100 
        ? `You've completed all ${type === "video" ? "training videos" : "playbook exercises"}!`
        : `Great progress! You're ${percent}% through the ${type === "video" ? "training videos" : "playbook"}.`,
      { url: type === "video" ? "/workouts" : "/playbook", tag: `${type}-${percent}` }
    );
  }, [sendNotification, isEnabled, preferences.achievements]);

  return {
    notifyBadgeEarned,
    notifyStreakMilestone,
    notifyCompletionMilestone,
  };
};

// Hook for sending post notifications
export const usePostNotifications = () => {
  const { sendNotification, isEnabled, preferences } = useNotifications();
  const { user } = useAuth();

  const notifyNewComment = useCallback((postExcerpt: string, commenterName: string) => {
    if (!isEnabled || !preferences.posts) return;
    
    sendNotification(
      "post",
      "New Comment 💬",
      `${commenterName} commented on your post: "${postExcerpt.slice(0, 50)}..."`,
      { url: "/community", tag: `comment-${Date.now()}` }
    );
  }, [sendNotification, isEnabled, preferences.posts]);

  const notifyNewLike = useCallback((postExcerpt: string, likerName: string) => {
    if (!isEnabled || !preferences.posts) return;
    
    sendNotification(
      "post",
      "Someone Liked Your Post ❤️",
      `${likerName} liked: "${postExcerpt.slice(0, 50)}..."`,
      { url: "/community", tag: `like-${Date.now()}` }
    );
  }, [sendNotification, isEnabled, preferences.posts]);

  const notifyMention = useCallback((postExcerpt: string, mentionerName: string) => {
    if (!isEnabled || !preferences.posts) return;
    
    sendNotification(
      "post",
      "You Were Mentioned! 📣",
      `${mentionerName} mentioned you: "${postExcerpt.slice(0, 50)}..."`,
      { url: "/community", tag: `mention-${Date.now()}` }
    );
  }, [sendNotification, isEnabled, preferences.posts]);

  return {
    notifyNewComment,
    notifyNewLike,
    notifyMention,
  };
};
