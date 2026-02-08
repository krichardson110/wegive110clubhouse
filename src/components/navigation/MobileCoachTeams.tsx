import { Link } from "react-router-dom";
import { Clipboard, Trophy, Users } from "lucide-react";
import { useCoachTeams } from "@/hooks/useCoachTeams";

interface MobileCoachTeamsProps {
  onItemClick: () => void;
}

const MobileCoachTeams = ({ onItemClick }: MobileCoachTeamsProps) => {
  const { coachTeams, isLoading, isCoach } = useCoachTeams();

  // Don't render if not a coach or still loading
  if (isLoading || !isCoach) {
    return null;
  }

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
    </>
  );
};

export default MobileCoachTeams;
