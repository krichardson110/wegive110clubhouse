import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Trophy, MessageSquare, Calendar, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const NotificationSettings = () => {
  const { 
    isSupported, 
    permission, 
    preferences, 
    requestPermission, 
    updatePreferences,
    isEnabled 
  } = useNotifications();

  if (!isSupported) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive updates about your team and training
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className={cn(
          "p-4 rounded-lg border",
          isEnabled 
            ? "bg-emerald-500/10 border-emerald-500/30" 
            : "bg-muted/50 border-border"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEnabled ? (
                <Bell className="w-5 h-5 text-emerald-500" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {isEnabled ? "Notifications Enabled" : "Notifications Disabled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled 
                    ? "You'll receive updates based on your preferences below" 
                    : permission === "denied"
                      ? "You've blocked notifications. Enable them in browser settings."
                      : "Enable notifications to stay updated"
                  }
                </p>
              </div>
            </div>
            {!isEnabled && permission !== "denied" && (
              <Button onClick={requestPermission} variant="outline">
                Enable
              </Button>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Notification Types</h4>
          
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            !isEnabled && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Calendar className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <Label htmlFor="games-toggle" className="cursor-pointer">
                  Game Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before games start
                </p>
              </div>
            </div>
            <Switch
              id="games-toggle"
              checked={preferences.games}
              onCheckedChange={(checked) => updatePreferences({ games: checked })}
              disabled={!isEnabled}
            />
          </div>

          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            !isEnabled && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <MessageSquare className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <Label htmlFor="posts-toggle" className="cursor-pointer">
                  Team Posts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Comments, likes, and mentions
                </p>
              </div>
            </div>
            <Switch
              id="posts-toggle"
              checked={preferences.posts}
              onCheckedChange={(checked) => updatePreferences({ posts: checked })}
              disabled={!isEnabled}
            />
          </div>

          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            !isEnabled && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <Label htmlFor="achievements-toggle" className="cursor-pointer">
                  Achievements
                </Label>
                <p className="text-sm text-muted-foreground">
                  Badges, streaks, and milestones
                </p>
              </div>
            </div>
            <Switch
              id="achievements-toggle"
              checked={preferences.achievements}
              onCheckedChange={(checked) => updatePreferences({ achievements: checked })}
              disabled={!isEnabled}
            />
          </div>

          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            !isEnabled && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label htmlFor="reminders-toggle" className="cursor-pointer">
                  Training Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Daily workout and playbook reminders
                </p>
              </div>
            </div>
            <Switch
              id="reminders-toggle"
              checked={preferences.reminders}
              onCheckedChange={(checked) => updatePreferences({ reminders: checked })}
              disabled={!isEnabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
