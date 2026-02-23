import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, CheckCircle2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useDrive5Categories } from "@/hooks/useDrive5";

interface PlayerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: {
    user_id: string;
    name: string;
    avatar_url?: string | null;
    weekly_checkins: number;
  } | null;
}

const PlayerDetailDialog = ({ open, onOpenChange, player }: PlayerDetailDialogProps) => {
  const { data: categories = [] } = useDrive5Categories();

  // Fetch player's goals
  const { data: goals = [] } = useQuery({
    queryKey: ["player-detail-goals", player?.user_id],
    queryFn: async () => {
      if (!player) return [];
      const { data, error } = await supabase
        .from("player_goals")
        .select("*, drive5_categories(*)")
        .eq("user_id", player.user_id)
        .eq("status", "active");
      if (error) throw error;
      return (data || []).map((g: any) => ({ ...g, category: g.drive5_categories }));
    },
    enabled: !!player && open,
  });

  // Fetch player's recent checkins (last 7 days)
  const { data: recentCheckins = [] } = useQuery({
    queryKey: ["player-detail-checkins", player?.user_id],
    queryFn: async () => {
      if (!player) return [];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*, drive5_categories(*)")
        .eq("user_id", player.user_id)
        .gte("checkin_date", weekAgo)
        .eq("completed", true)
        .order("checkin_date", { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any) => ({ ...c, category: c.drive5_categories }));
    },
    enabled: !!player && open,
  });

  // Calculate streak
  const { data: streakData } = useQuery({
    queryKey: ["player-detail-streak", player?.user_id],
    queryFn: async () => {
      if (!player) return { current: 0, longest: 0 };
      const { data: checkins, error } = await supabase
        .from("daily_checkins")
        .select("checkin_date")
        .eq("user_id", player.user_id)
        .eq("completed", true)
        .order("checkin_date", { ascending: false });
      if (error) throw error;
      if (!checkins?.length) return { current: 0, longest: 0 };

      const uniqueDates = [...new Set(checkins.map(c => c.checkin_date))].sort().reverse();
      let currentStreak = 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        for (let i = 0; i < uniqueDates.length; i++) {
          const expected = new Date(Date.now() - (i * 86400000) - (uniqueDates[0] === yesterday ? 86400000 : 0));
          if (uniqueDates[i] === expected.toISOString().split("T")[0]) {
            currentStreak++;
          } else break;
        }
      }

      let longestStreak = 0, tempStreak = 1;
      const sorted = [...uniqueDates].sort();
      for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
        if (diff === 1) tempStreak++;
        else { longestStreak = Math.max(longestStreak, tempStreak); tempStreak = 1; }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
      return { current: currentStreak, longest: longestStreak };
    },
    enabled: !!player && open,
  });

  // Category breakdown for the week
  const categoryBreakdown = categories.map(cat => {
    const count = recentCheckins.filter(c => c.category_id === cat.id).length;
    return { ...cat, weeklyCount: count, maxPossible: 7 };
  });

  if (!player) return null;

  const initials = player.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{player.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">Drive 5 Progress</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Streak Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xl font-bold">{streakData?.current || 0}</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Target className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-xl font-bold">{streakData?.longest || 0}</p>
              <p className="text-xs text-muted-foreground">Best</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-xl font-bold">{player.weekly_checkins}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly Category Breakdown
            </h4>
            <div className="space-y-2.5">
              {categoryBreakdown.map(cat => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="text-muted-foreground">{cat.weeklyCount}/7</span>
                  </div>
                  <Progress value={(cat.weeklyCount / 7) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          {goals.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                90-Day Goals
              </h4>
              <div className="space-y-2.5">
                {goals.map((goal: any) => {
                  const progress = goal.target_value > 0
                    ? Math.round((goal.current_value / goal.target_value) * 100)
                    : 0;
                  return (
                    <div key={goal.id} className="p-3 rounded-lg border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <span>{goal.category?.icon || "🎯"}</span>
                          {goal.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Check-ins */}
          {recentCheckins.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Recent Check-ins</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {recentCheckins.slice(0, 15).map((checkin: any) => (
                  <div key={checkin.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-secondary/30">
                    <span className="flex items-center gap-1.5">
                      <span>{checkin.category?.icon || "✅"}</span>
                      <span>{checkin.category?.name || "Unknown"}</span>
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(checkin.checkin_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerDetailDialog;
