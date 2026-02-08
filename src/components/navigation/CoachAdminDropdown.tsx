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
import { ChevronDown, Clipboard, Trophy, Users } from "lucide-react";
import { useCoachTeams } from "@/hooks/useCoachTeams";

const CoachAdminDropdown = () => {
  const location = useLocation();
  const { coachTeams, isLoading, isCoach } = useCoachTeams();

  // Don't render if not a coach or still loading
  if (isLoading || !isCoach) {
    return null;
  }

  const isActive = location.pathname.includes("/teams/") && location.pathname.includes("/admin");

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CoachAdminDropdown;
