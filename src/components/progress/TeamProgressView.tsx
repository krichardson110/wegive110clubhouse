import { useTeamProgress, TeamMemberProgress } from "@/hooks/useTeamProgress";
import { formatProgressTime } from "@/hooks/usePlayerProgress";
import ProgressRing from "./ProgressRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Trophy, 
  Flame,
  Video,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const TeamProgressView = () => {
  const { data: teamsProgress, isLoading } = useTeamProgress();

  if (isLoading) {
    return <TeamProgressSkeleton />;
  }

  if (!teamsProgress?.length) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Team Progress</h2>
      </div>

      {teamsProgress.length === 1 ? (
        <TeamProgressSection team={teamsProgress[0]} />
      ) : (
        <Tabs defaultValue={teamsProgress[0].teamId} className="w-full">
          <TabsList className="mb-4">
            {teamsProgress.map(team => (
              <TabsTrigger key={team.teamId} value={team.teamId}>
                {team.teamName}
              </TabsTrigger>
            ))}
          </TabsList>
          {teamsProgress.map(team => (
            <TabsContent key={team.teamId} value={team.teamId}>
              <TeamProgressSection team={team} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

const TeamProgressSection = ({ team }: { team: { teamName: string; members: TeamMemberProgress[] } }) => {
  const coaches = team.members.filter(m => m.role === 'coach');
  const playersAndParents = team.members.filter(m => m.role !== 'coach');

  // Calculate team averages
  const avgEngagement = Math.round(
    team.members.reduce((acc, m) => acc + m.progress.overallEngagementScore, 0) / team.members.length
  );
  const totalActivePlayers = playersAndParents.filter(m => m.progress.currentStreak > 0).length;

  return (
    <div className="space-y-6">
      {/* Team Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-foreground">{team.members.length}</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-foreground">{avgEngagement}</p>
            <p className="text-sm text-muted-foreground">Avg. Score</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-foreground">{totalActivePlayers}</p>
            <p className="text-sm text-muted-foreground">Active Streaks</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-foreground">
              {Math.max(...team.members.map(m => m.progress.currentStreak))}
            </p>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Player Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {playersAndParents.slice(0, 10).map((member, index) => (
              <PlayerProgressRow 
                key={member.memberId} 
                member={member} 
                rank={index + 1}
              />
            ))}
            {playersAndParents.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No players on this team yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Members Grid */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">All Members</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.members.map(member => (
            <PlayerProgressCard key={member.memberId} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PlayerProgressRow = ({ member, rank }: { member: TeamMemberProgress; rank: number }) => {
  const { progress } = member;
  
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
      {/* Rank */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
        rank === 1 && "bg-yellow-500/20 text-yellow-500",
        rank === 2 && "bg-gray-400/20 text-gray-400",
        rank === 3 && "bg-orange-600/20 text-orange-600",
        rank > 3 && "bg-muted/30 text-muted-foreground"
      )}>
        {rank}
      </div>

      {/* Avatar & Name */}
      <Avatar className="w-10 h-10">
        <AvatarImage src={member.avatarUrl || undefined} />
        <AvatarFallback className="bg-primary/20 text-primary">
          {member.playerName?.charAt(0)?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{member.playerName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {member.role === 'parent' && member.players && (
            <span>Parent of {member.players.length} player(s)</span>
          )}
          {member.role === 'coach' && (
            <Badge variant="outline" className="text-xs">Coach</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Flame className={cn("w-4 h-4", progress.currentStreak > 0 && "text-orange-500")} />
          <span>{progress.currentStreak}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Video className="w-4 h-4" />
          <span>{progress.videosWatched}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{progress.exercisesCompleted}</span>
        </div>
      </div>

      {/* Score */}
      <ProgressRing 
        progress={progress.overallEngagementScore} 
        size={44}
        strokeWidth={4}
        color="primary"
      >
        <span className="text-xs font-bold">{progress.overallEngagementScore}</span>
      </ProgressRing>
    </div>
  );
};

const PlayerProgressCard = ({ member }: { member: TeamMemberProgress }) => {
  const { progress } = member;

  return (
    <Card className="glass-card">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={member.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {member.playerName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground truncate">{member.playerName}</p>
              {member.role === 'coach' && (
                <Badge variant="outline" className="text-xs shrink-0">Coach</Badge>
              )}
            </div>
            {member.role === 'parent' && member.players && (
              <p className="text-xs text-muted-foreground">
                Parent of {member.players.map(p => p.player_name).join(', ')}
              </p>
            )}
          </div>

          <ProgressRing 
            progress={progress.overallEngagementScore} 
            size={50}
            strokeWidth={4}
            color="primary"
          >
            <span className="text-sm font-bold">{progress.overallEngagementScore}</span>
          </ProgressRing>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="p-2 rounded-lg bg-muted/20">
            <div className="flex items-center justify-center gap-1">
              <Flame className={cn("w-4 h-4", progress.currentStreak > 0 && "text-orange-500")} />
              <span className="font-semibold">{progress.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20">
            <p className="font-semibold">{progress.videoCompletionPercent}%</p>
            <p className="text-xs text-muted-foreground">Videos</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20">
            <p className="font-semibold">{progress.playbookCompletionPercent}%</p>
            <p className="text-xs text-muted-foreground">Playbook</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {progress.activeDaysThisWeek}/7 days this week
          </span>
          <span>{formatProgressTime(progress.thisWeekWatchSeconds)} watched</span>
        </div>
      </CardContent>
    </Card>
  );
};

const TeamProgressSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <Skeleton className="w-6 h-6 rounded" />
      <Skeleton className="h-8 w-48" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="glass-card">
          <CardContent className="pt-4">
            <Skeleton className="h-10 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="glass-card">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </CardContent>
    </Card>
  </div>
);

export default TeamProgressView;
