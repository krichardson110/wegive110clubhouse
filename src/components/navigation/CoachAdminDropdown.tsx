import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clipboard, Plus, Trophy, Users } from "lucide-react";
import { useCoachTeams } from "@/hooks/useCoachTeams";
import { useTeams } from "@/hooks/useTeams";
import CreateTeamForm from "@/components/teams/CreateTeamForm";

const CoachAdminDropdown = () => {
  const location = useLocation();
  const { coachTeams, isLoading, isCoach } = useCoachTeams();
  const { teams, createTeam, isCreating } = useTeams();
  const [createFormOpen, setCreateFormOpen] = useState(false);

  // Don't render if not a coach or still loading
  if (isLoading || !isCoach) {
    return null;
  }

  const isActive = location.pathname.includes("/teams/") && location.pathname.includes("/admin");

  const canCreateTeam = teams.length === 0 || teams.some(team => team.userRole === "coach");

  const handleCreateTeam = (data: Parameters<typeof createTeam>[0]) => {
    createTeam(data, {
      onSuccess: () => setCreateFormOpen(false),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 px-3 py-2 h-auto text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-accent/20 text-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            Manage Team
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background border border-border z-50">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            Your Teams
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {coachTeams.map((team) => (
            <DropdownMenuItem key={team.id} asChild>
              <Link
                to={`/teams/${team.id}/admin`}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">{team.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {team.memberCount}
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
          
          {coachTeams.length === 0 && (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">No teams found</span>
            </DropdownMenuItem>
          )}

          {canCreateTeam && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateFormOpen(true)} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTeamForm
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        onSubmit={handleCreateTeam}
        isLoading={isCreating}
      />
    </>
  );
};

export default CoachAdminDropdown;
