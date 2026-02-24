import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeamCategoryLeaderboard, useDrive5Categories } from "@/hooks/useDrive5";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamCategoryLeaderboardProps {
  teamId?: string;
}

const TeamCategoryLeaderboard = ({ teamId }: TeamCategoryLeaderboardProps) => {
  const { data: leaderboard = [], isLoading } = useTeamCategoryLeaderboard(teamId);
  const { data: categories = [] } = useDrive5Categories();

  if (!teamId || (leaderboard.length === 0 && !isLoading)) return null;

  const getRankStyle = (idx: number) => {
    if (idx === 0) return "bg-accent/20 text-accent border-accent/30";
    if (idx === 1) return "bg-muted text-muted-foreground border-border";
    if (idx === 2) return "bg-primary/10 text-primary border-primary/20";
    return "";
  };

  const getRankIcon = (idx: number) => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return `${idx + 1}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-accent" />
          Team Leaderboard
          <span className="text-xs font-normal text-muted-foreground ml-auto">Last 7 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Category header row */}
            <div className="flex items-center gap-2 px-2 pb-1 border-b border-border">
              <div className="w-8" />
              <div className="w-8" />
              <div className="flex-1 text-xs font-medium text-muted-foreground">Player</div>
              {categories.map(cat => (
                <div key={cat.id} className="w-10 text-center" title={cat.name}>
                  <span className="text-sm">{cat.icon}</span>
                </div>
              ))}
              <div className="w-12 text-center text-xs font-semibold text-muted-foreground">Total</div>
            </div>

            {leaderboard.map((player, idx) => (
              <div
                key={player.user_id}
                className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  idx < 3 ? getRankStyle(idx) + " border" : "hover:bg-secondary/50"
                }`}
              >
                {/* Rank */}
                <span className="w-8 text-center text-sm font-bold">
                  {getRankIcon(idx)}
                </span>

                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {player.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{player.name}</p>
                </div>

                {/* Category counts */}
                {categories.map(cat => {
                  const count = player.category_completions[cat.id] || 0;
                  return (
                    <div
                      key={cat.id}
                      className={`w-10 text-center text-sm font-mono ${
                        count > 0 ? "font-semibold text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {count}
                    </div>
                  );
                })}

                {/* Total */}
                <div className="w-12 text-center">
                  <span className="text-sm font-bold">{player.total_completions}</span>
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity yet this week
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamCategoryLeaderboard;
