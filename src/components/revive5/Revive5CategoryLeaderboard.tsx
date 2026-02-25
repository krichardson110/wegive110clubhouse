import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useRevive5Categories, useRevive5CategoryLeaderboard } from "@/hooks/useRevive5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Revive5CategoryLeaderboardProps {
  teamId?: string;
}

const Revive5CategoryLeaderboard = ({ teamId }: Revive5CategoryLeaderboardProps) => {
  const { data: categories = [] } = useRevive5Categories();
  const { data: leaderboard = [] } = useRevive5CategoryLeaderboard(teamId);

  if (!teamId || leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Join a team to see the leaderboard.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="w-5 h-5 text-accent" />
          7-Day Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <span className="w-6">#</span>
          <span className="w-8" />
          <span className="flex-1">Player</span>
          {categories.map((cat) => (
            <Tooltip key={cat.id}>
              <TooltipTrigger asChild>
                <span className="w-8 text-center cursor-help">{cat.icon}</span>
              </TooltipTrigger>
              <TooltipContent>{cat.name}</TooltipContent>
            </Tooltip>
          ))}
          <span className="w-10 text-right font-semibold">Total</span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((player, idx) => (
            <div key={player.user_id} className="flex items-center gap-2 py-1">
              <span className={`text-sm font-bold w-6 ${idx < 3 ? "text-accent" : "text-muted-foreground"}`}>
                {idx + 1}
              </span>
              <Avatar className="h-7 w-7">
                <AvatarImage src={player.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                  {player.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium truncate">{player.name}</span>
              {categories.map((cat) => (
                <span key={cat.id} className="w-8 text-center text-sm">
                  {player.category_completions[cat.id] || 0}
                </span>
              ))}
              <span className="w-10 text-right text-sm font-bold">{player.total_completions}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Revive5CategoryLeaderboard;
