import { useState } from "react";
import { Link } from "react-router-dom";
import { Clipboard, Plus, Trophy, Users } from "lucide-react";
import { useCoachTeams } from "@/hooks/useCoachTeams";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import CreateTeamForm from "@/components/teams/CreateTeamForm";

interface MobileCoachTeamsProps {
  onItemClick: () => void;
}

const MobileCoachTeams = ({ onItemClick }: MobileCoachTeamsProps) => {
  const { coachTeams, isLoading, isCoach } = useCoachTeams();
  const { teams, createTeam, isCreating } = useTeams();
  const [createFormOpen, setCreateFormOpen] = useState(false);

  // Don't render if not a coach or still loading
  if (isLoading || !isCoach) {
    return null;
  }

  const canCreateTeam = teams.length === 0 || teams.some(team => team.userRole === "coach");

  const handleCreateTeam = (data: Parameters<typeof createTeam>[0]) => {
    createTeam(data, {
      onSuccess: () => setCreateFormOpen(false),
    });
  };

  return (
    <>
      <div className="pt-2 pb-1">
        <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clipboard className="w-3 h-3" />
          Coach Admin
        </span>
      </div>
      {coachTeams.map((team) => (
        <Link
          key={team.id}
          to={`/teams/${team.id}/admin`}
          onClick={onItemClick}
          className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="truncate">{team.name}</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {team.memberCount}
          </span>
        </Link>
      ))}
      {canCreateTeam && (
        <Button
          variant="ghost"
          onClick={() => setCreateFormOpen(true)}
          className="flex items-center gap-3 w-full justify-start px-3 py-3 text-sm font-medium text-primary hover:bg-secondary"
        >
          <Plus className="w-5 h-5" />
          Create New Team
        </Button>
      )}

      <CreateTeamForm
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        onSubmit={handleCreateTeam}
        isLoading={isCreating}
      />
    </>
  );
};

export default MobileCoachTeams;
