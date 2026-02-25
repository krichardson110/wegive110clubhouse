import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, CheckCircle2, FileText, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useRevive5Categories,
  useRevive5Goals,
  useRevive5Streak,
  useRevive5TeamLeaderboard,
} from "@/hooks/useRevive5";
import { useAllActiveRevive5Tasks, useRevive5TaskCompletions } from "@/hooks/useRevive5GoalTasks";
import CollapsibleSection from "@/components/drive5/CollapsibleSection";
import Revive5WeeklyChart from "./Revive5WeeklyChart";
import Revive5CategoryLeaderboard from "./Revive5CategoryLeaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Revive5DashboardTabProps {
  teamId?: string;
}

const Revive5DashboardTab = ({ teamId }: Revive5DashboardTabProps) => {
  const { user } = useAuth();
  const { data: tasks = [] } = useAllActiveRevive5Tasks(teamId);
  const { data: completions = [] } = useRevive5TaskCompletions();
  const { data: streak } = useRevive5Streak(teamId);
  const { data: leaderboard = [] } = useRevive5TeamLeaderboard(teamId);

  const completedToday = tasks.filter((t: any) => completions.some((c) => c.task_id === t.id && c.completed)).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <CollapsibleSection title="Quick Stats" icon={<Heart className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="w-8 h-8 mx-auto text-accent mb-2" />
              <p className="text-3xl font-sans font-bold">{streak?.current_streak || 0}</p>
              <p className="text-sm font-sans text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle2 className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-sans font-bold">
                {completedToday}/{totalTasks}
              </p>
              <p className="text-sm font-sans text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="w-8 h-8 mx-auto text-accent mb-2" />
              <p className="text-3xl font-sans font-bold">{streak?.longest_streak || 0}</p>
              <p className="text-sm font-sans text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
        </div>
      </CollapsibleSection>

      {/* Weekly Progress Chart */}
      <CollapsibleSection title="Weekly Progress" icon={<BarChart3 className="w-4 h-4" />}>
        <Revive5WeeklyChart teamId={teamId} />
      </CollapsibleSection>

      {/* Team Category Leaderboard */}
      <CollapsibleSection title="Team Leaderboard" icon={<Trophy className="w-4 h-4" />}>
        <Revive5CategoryLeaderboard teamId={teamId} />
      </CollapsibleSection>

      {/* Weekly Leaderboard */}
      {teamId && leaderboard.length > 0 && (
        <CollapsibleSection title="Weekly Leaderboard" icon={<Trophy className="w-4 h-4" />}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((player, idx) => (
                  <div key={player.user_id} className="flex items-center gap-3 p-1 rounded-lg">
                    <span className={`text-lg font-bold w-6 ${idx < 3 ? "text-accent" : "text-muted-foreground"}`}>
                      {idx + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {player.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
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
        </CollapsibleSection>
      )}
    </div>
  );
};

export default Revive5DashboardTab;
