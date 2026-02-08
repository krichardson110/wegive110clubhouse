import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTeams } from "@/hooks/useTeams";
import TeamCard from "@/components/teams/TeamCard";
import CreateTeamForm from "@/components/teams/CreateTeamForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Trophy } from "lucide-react";

const MyTeams = () => {
  const { user, loading: authLoading } = useAuth();
  const { teams, isLoading, createTeam, isCreating } = useTeams();
  const [createFormOpen, setCreateFormOpen] = useState(false);

  // User can create teams if they have no teams yet (new user) or if they're a coach on at least one team
  const canCreateTeam = teams.length === 0 || teams.some(team => team.userRole === "coach");

  const handleCreateTeam = (data: Parameters<typeof createTeam>[0]) => {
    createTeam(data, {
      onSuccess: () => setCreateFormOpen(false),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign in to access your teams</h1>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <Trophy className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Teams
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
                  MY <span className="gradient-text">TEAMS</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Manage your teams, invite players, and stay connected with your community.
                </p>
              </div>
              
              {canCreateTeam && (
                <Button onClick={() => setCreateFormOpen(true)} size="lg" className="hidden sm:flex">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Team
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Teams Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Mobile create button - only show for coaches */}
            {canCreateTeam && (
              <Button 
                onClick={() => setCreateFormOpen(true)} 
                className="w-full mb-6 sm:hidden"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Team
              </Button>
            )}

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No teams yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first team or join one using an invite link.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {canCreateTeam && (
                    <Button onClick={() => setCreateFormOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create a Team
                    </Button>
                  )}
                  <Link to="/teams/join">
                    <Button variant={canCreateTeam ? "outline" : "default"}>
                      Join with Invite Code
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map(team => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <CreateTeamForm
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        onSubmit={handleCreateTeam}
        isLoading={isCreating}
      />
    </div>
  );
};

export default MyTeams;
