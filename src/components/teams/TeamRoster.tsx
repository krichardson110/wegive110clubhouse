import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Trash2, UserCog } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMember } from "@/types/team";

interface TeamRosterProps {
  members: TeamMember[];
  isLoading: boolean;
  isCoach: boolean;
  onRemoveMember?: (memberId: string) => void;
}

const TeamRoster = ({ members, isLoading, isCoach, onRemoveMember }: TeamRosterProps) => {
  const coaches = members.filter(m => m.role === "coach");
  const players = members.filter(m => m.role === "player");
  const parents = members.filter(m => m.role === "parent");

  const getInitials = (member: TeamMember) => {
    const name = member.player_name || member.profile?.display_name || "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDisplayName = (member: TeamMember) => {
    return member.player_name || member.profile?.display_name || "Unknown";
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "coach": return "default";
      case "parent": return "secondary";
      default: return "outline";
    }
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

  const renderMemberRow = (member: TeamMember) => (
    <div
      key={member.id}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={member.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/20 text-primary">
          {getInitials(member)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{getDisplayName(member)}</span>
          {member.player_number && (
            <span className="text-sm text-muted-foreground">#{member.player_number}</span>
          )}
        </div>
        {member.position && (
          <span className="text-sm text-muted-foreground">{member.position}</span>
        )}
      </div>

      <Badge variant={getRoleBadgeVariant(member.role)}>
        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
      </Badge>

      {isCoach && member.role !== "coach" && (
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
                    Are you sure you want to remove {getDisplayName(member)} from the team?
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
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Team Roster</span>
          <span className="text-sm font-normal text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {coaches.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Coaches</h4>
            <div className="space-y-1">
              {coaches.map(renderMemberRow)}
            </div>
          </div>
        )}

        {players.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Players</h4>
            <div className="space-y-1">
              {players.map(renderMemberRow)}
            </div>
          </div>
        )}

        {parents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Parents</h4>
            <div className="space-y-1">
              {parents.map(renderMemberRow)}
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
