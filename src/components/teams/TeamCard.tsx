import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, ChevronRight } from "lucide-react";
import type { Team } from "@/types/team";

interface TeamCardProps {
  team: Team & { userRole?: string };
}

const TeamCard = ({ team }: TeamCardProps) => {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "coach":
        return <Badge className="bg-accent text-accent-foreground">Coach</Badge>;
      case "parent":
        return <Badge variant="secondary">Parent</Badge>;
      default:
        return <Badge variant="outline">Player</Badge>;
    }
  };

  return (
    <Link to={`/teams/${team.id}`}>
      <Card className="group hover:border-primary/50 transition-all duration-300 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
                {team.age_group && (
                  <p className="text-sm text-muted-foreground">{team.age_group}</p>
                )}
              </div>
            </div>
            {getRoleBadge(team.userRole)}
          </div>
        </CardHeader>
        <CardContent>
          {team.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {team.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{team.season || "Current Season"}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamCard;
