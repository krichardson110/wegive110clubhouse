import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Flame, Target, Trophy, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useDrive5Categories, 
  usePlayerGoals, 
  useDailyCheckins, 
  useToggleCheckin, 
  usePlayerStreak,
  useTeamLeaderboard 
} from "@/hooks/useDrive5";
import GoalSetupDialog from "./GoalSetupDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Drive5DashboardProps {
  teamId?: string;
}

const Drive5Dashboard = ({ teamId }: Drive5DashboardProps) => {
  const { user } = useAuth();
  const { data: categories = [] } = useDrive5Categories();
  const { data: goals = [] } = usePlayerGoals(teamId);
  const { data: checkins = [] } = useDailyCheckins(undefined, teamId);
  const { data: streak } = usePlayerStreak(teamId);
  const { data: leaderboard = [] } = useTeamLeaderboard(teamId);
  const toggleCheckin = useToggleCheckin();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const completedToday = checkins.filter(c => c.completed).length;
  const totalCategories = categories.length;

  const handleToggle = (categoryId: string) => {
    if (!user) return;
    const existing = checkins.find(c => c.category_id === categoryId);
    const goal = goals.find(g => g.category_id === categoryId);
    
    toggleCheckin.mutate({
      user_id: user.id,
      team_id: teamId,
      category_id: categoryId,
      checkin_date: today,
      completed: !existing?.completed,
      goal_id: goal?.id,
    });
  };

  const isCheckedIn = (categoryId: string) => {
    return checkins.some(c => c.category_id === categoryId && c.completed);
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-3xl font-bold">{streak?.current_streak || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold">{completedToday}/{totalCategories}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-3xl font-bold">{streak?.longest_streak || 0}</p>
            <p className="text-sm text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Check-In */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daily Check-In</span>
            <span className="text-sm font-normal text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(cat => {
            const checked = isCheckedIn(cat.id);
            const goal = goals.find(g => g.category_id === cat.id);
            return (
              <div
                key={cat.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  checked ? "bg-green-500/10 border-green-500/30" : "hover:bg-secondary/50 border-border"
                }`}
                onClick={() => handleToggle(cat.id)}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(cat.id)}
                  className="pointer-events-none"
                />
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${checked ? "line-through text-muted-foreground" : ""}`}>
                    {cat.name}
                  </p>
                  {goal && (
                    <p className="text-xs text-muted-foreground truncate">{goal.title}</p>
                  )}
                </div>
                {checked && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>90-Day Goals</span>
            </div>
            <Button size="sm" onClick={() => setGoalDialogOpen(true)}>
              Set Goals
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No goals set yet. Set your 90-day goals to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => {
                const progress = goal.target_value > 0 
                  ? Math.round((goal.current_value / goal.target_value) * 100) 
                  : 0;
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{goal.category?.icon || "🎯"}</span>
                        <span className="font-medium text-sm">{goal.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {goal.current_value}/{goal.target_value}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Leaderboard */}
      {teamId && leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Weekly Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((player, idx) => (
                <div key={player.user_id} className="flex items-center gap-3">
                  <span className={`text-lg font-bold w-6 ${idx < 3 ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {idx + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={player.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {player.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{player.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{player.weekly_checkins}</p>
                    <p className="text-xs text-muted-foreground">check-ins</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <GoalSetupDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        categories={categories}
        existingGoals={goals}
        teamId={teamId}
      />
    </div>
  );
};

export default Drive5Dashboard;
