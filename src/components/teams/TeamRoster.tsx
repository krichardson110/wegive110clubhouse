import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Trash2, UserCog, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMember, TeamMemberPlayer } from "@/types/team";

interface TeamRosterProps {
  members: TeamMember[];
  isLoading: boolean;
  isCoach: boolean;
  onRemoveMember?: (memberId: string) => void;
}

const TeamRoster = ({ members, isLoading, isCoach, onRemoveMember }: TeamRosterProps) => {
  const coaches = members.filter(m => m.role === "coach");
  // Combine players and parents - they have the same functionality now
  const playerMembers = members.filter(m => m.role === "player" || m.role === "parent");

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAccountHolderName = (member: TeamMember) => {
    return member.profile?.display_name || "Unknown";
  };

  // Get all players for display - either from players array or legacy player_name field
  const getMemberPlayers = (member: TeamMember): { name: string; number: string | null; position: string | null }[] => {
    // If member has players in the new table, use those
    if (member.players && member.players.length > 0) {
      return member.players.map(p => ({
        name: p.player_name,
        number: p.player_number,
        position: p.position
      }));
    }
    // Fall back to legacy player_name field on team_members
    if (member.player_name) {
      return [{
        name: member.player_name,
        number: member.player_number,
        position: member.position
      }];
    }
    return [];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const renderCoachRow = (member: TeamMember) => (
    <div
      key={member.id}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={member.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/20 text-primary">
          {getInitials(getAccountHolderName(member))}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <span className="font-medium">{getAccountHolderName(member)}</span>
      </div>

      <Badge variant="default">Coach</Badge>
    </div>
  );

  const renderPlayerMemberRow = (member: TeamMember) => {
    const players = getMemberPlayers(member);
    const accountName = getAccountHolderName(member);
    const isParentAccount = member.role === "parent";

    return (
      <div
        key={member.id}
        className="p-3 rounded-lg hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {getInitials(players[0]?.name || accountName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {players.length === 0 ? (
              <span className="font-medium text-muted-foreground">{accountName}</span>
            ) : players.length === 1 ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{players[0].name}</span>
                  {players[0].number && (
                    <span className="text-sm text-muted-foreground">#{players[0].number}</span>
                  )}
                </div>
                {players[0].position && (
                  <span className="text-sm text-muted-foreground">{players[0].position}</span>
                )}
                {isParentAccount && (
                  <span className="text-xs text-muted-foreground block">
                    Managed by {accountName}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{players.length} Players</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Managed by {accountName}
                </span>
              </div>
            )}
          </div>

          <Badge variant={isParentAccount ? "secondary" : "outline"}>
            {isParentAccount ? "Parent" : "Player"}
          </Badge>

          {isCoach && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <UserCog className="w-4 h-4 mr-2" />
                  Edit Member
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove from Team
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Member</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this member from the team?
                        {players.length > 1 && ` This will also remove all ${players.length} associated players.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemoveMember?.(member.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Show all players if multiple */}
        {players.length > 1 && (
          <div className="mt-2 ml-13 pl-10 border-l-2 border-border space-y-2">
            {players.map((player, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1">
                <span className="font-medium text-sm">{player.name}</span>
                {player.number && (
                  <span className="text-xs text-muted-foreground">#{player.number}</span>
                )}
                {player.position && (
                  <span className="text-xs text-muted-foreground">• {player.position}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Count total players for display
  const totalPlayers = playerMembers.reduce((count, member) => {
    const players = getMemberPlayers(member);
    return count + (players.length || 1);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Team Roster</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalPlayers} player{totalPlayers !== 1 ? "s" : ""}, {coaches.length} coach{coaches.length !== 1 ? "es" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {coaches.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Coaches</h4>
            <div className="space-y-1">
              {coaches.map(renderCoachRow)}
            </div>
          </div>
        )}

        {playerMembers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Players & Families</h4>
            <div className="space-y-1">
              {playerMembers.map(renderPlayerMemberRow)}
            </div>
          </div>
        )}

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No team members yet. Invite players to get started!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamRoster;