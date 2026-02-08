import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NotificationPrompt = () => {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const wasDismissed = sessionStorage.getItem("notification_prompt_dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after a short delay if not already granted/denied
    if (isSupported && permission === "default") {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    sessionStorage.setItem("notification_prompt_dismissed", "true");
  };

  const handleEnable = async () => {
    await requestPermission();
    handleDismiss();
  };

  if (!isSupported || permission !== "default" || dismissed || !isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm",
      "animate-in slide-in-from-bottom-4 duration-300"
    )}>
      <Card className="glass-card border-primary/30 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/20 shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground mb-1">
                Stay in the Game! 🏆
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Get notified about upcoming games, team posts, and achievements.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleEnable}
                  className="bg-primary hover:bg-primary/90"
                >
                  Enable Notifications
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleDismiss}
                >
                  Not Now
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPrompt;
