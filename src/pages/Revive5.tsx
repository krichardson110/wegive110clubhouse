import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Revive5Dashboard from "@/components/revive5/Revive5Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useTeams } from "@/hooks/useTeams";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Heart } from "lucide-react";

const Revive5 = () => {
  const { user } = useAuth();
  const { teams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();

  const teamId = selectedTeamId || (teams.length === 1 ? teams[0].id : undefined);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="relative py-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-rose-500 uppercase tracking-wider">
                    Revive 5
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">
                  Nourish Your Soul
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track daily growth across 5 spiritual pillars
                </p>
              </div>

              {teams.length > 1 && (
                <Select value={teamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="container mx-auto px-4">
            <Revive5Dashboard teamId={teamId} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Revive5;
