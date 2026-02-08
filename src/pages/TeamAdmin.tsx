import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTeam, useTeamMembers } from "@/hooks/useTeams";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  Users, 
  Dumbbell, 
  Video, 
  BookOpen,
  Settings
} from "lucide-react";
import TeamRoster from "@/components/teams/TeamRoster";
import TeamSchedule from "@/components/teams/TeamSchedule";
import TeamWorkoutsContent from "@/components/teams/TeamWorkoutsContent";
import TeamVideosContent from "@/components/teams/TeamVideosContent";
import TeamPlaybookContent from "@/components/teams/TeamPlaybookContent";
import TeamAdminContentAssignment from "@/components/teams/TeamAdminContentAssignment";

const TeamAdmin = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { team, isLoading: teamLoading, isCoach, isMember } = useTeam(teamId);
  const { members, isLoading: membersLoading, removeMember } = useTeamMembers(teamId);
  const [activeTab, setActiveTab] = useState("roster");

  useEffect(() => {
    if (!authLoading && !teamLoading && (!user || !isMember || !isCoach)) {
      navigate(`/teams/${teamId || ""}`);
    }
  }, [user, isMember, isCoach, authLoading, teamLoading, navigate, teamId]);

  if (authLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!team || !isCoach) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You must be a coach to access team admin features.
            </p>
            <Link to="/teams">
              <Button>Back to My Teams</Button>
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
        {/* Header Section */}
        <section className="relative py-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <Link 
              to={`/teams/${teamId}`} 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Coach Admin
                  </span>
                </div>
                
                <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">
                  {team.name}
                </h1>
                {team.age_group && (
                  <p className="text-muted-foreground mt-1">{team.age_group} • {team.season || "Active"}</p>
                )}
              </div>
              
              <Link to={`/teams/${teamId}/settings`}>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Team Settings
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Admin Tabs */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-secondary/50 p-1">
                <TabsTrigger value="roster" className="flex-1 min-w-[100px] gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Roster</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1 min-w-[100px] gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </TabsTrigger>
                <TabsTrigger value="workouts" className="flex-1 min-w-[100px] gap-2">
                  <Dumbbell className="w-4 h-4" />
                  <span className="hidden sm:inline">Workouts</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex-1 min-w-[100px] gap-2">
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="playbook" className="flex-1 min-w-[100px] gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Playbook</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="roster" className="mt-0">
                  <TeamRoster 
                    members={members} 
                    isLoading={membersLoading} 
                    isCoach={isCoach} 
                    onRemoveMember={removeMember}
                  />
                </TabsContent>
                
                <TabsContent value="schedule" className="mt-0">
                  <TeamSchedule teamId={teamId!} isCoach={isCoach} />
                </TabsContent>
                
                <TabsContent value="workouts" className="mt-0">
                  <div className="space-y-6">
                    <TeamAdminContentAssignment 
                      teamId={teamId!} 
                      contentType="workouts"
                    />
                    <TeamWorkoutsContent />
                  </div>
                </TabsContent>
                
                <TabsContent value="videos" className="mt-0">
                  <div className="space-y-6">
                    <TeamAdminContentAssignment 
                      teamId={teamId!} 
                      contentType="videos"
                    />
                    <TeamVideosContent />
                  </div>
                </TabsContent>
                
                <TabsContent value="playbook" className="mt-0">
                  <div className="space-y-6">
                    <TeamAdminContentAssignment 
                      teamId={teamId!} 
                      contentType="playbook"
                    />
                    <TeamPlaybookContent />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TeamAdmin;
