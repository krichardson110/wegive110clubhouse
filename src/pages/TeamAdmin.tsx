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
  MessageSquare,
  Settings,
  UserPlus,
  Flame,
  LayoutGrid
} from "lucide-react";
import TeamRoster from "@/components/teams/TeamRoster";
import TeamSchedule from "@/components/teams/TeamSchedule";
import TeamWorkoutsContent from "@/components/teams/TeamWorkoutsContent";
import TeamVideosContent from "@/components/teams/TeamVideosContent";
import TeamPlaybookContent from "@/components/teams/TeamPlaybookContent";
import AddMemberForm from "@/components/teams/AddMemberForm";

import CreatePostForm from "@/components/community/CreatePostForm";
import PostsFeed from "@/components/community/PostsFeed";
import Drive5Dashboard from "@/components/drive5/Drive5Dashboard";
import DepthChart from "@/components/teams/DepthChart";
import BattingLineupManager from "@/components/teams/BattingLineupManager";
import { useDepthChart } from "@/hooks/useDepthChart";

const TeamAdmin = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { team, isLoading: teamLoading, isCoach, isMember } = useTeam(teamId);
  const { members, isLoading: membersLoading, removeMember, editMemberPlayers, isEditingPlayers, refetch: refetchMembers } = useTeamMembers(teamId);
  const [activeTab, setActiveTab] = useState("feed");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [defaultRole, setDefaultRole] = useState<'player' | 'parent' | 'coach'>('player');

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
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You need coach access to manage this team.</p>
            <Link to="/my-teams">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Teams
              </Button>
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
        <section className="py-6 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to={`/teams/${teamId}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">
                    {team.name}
                  </h1>
                  <p className="text-muted-foreground text-sm">Team Administration</p>
                </div>
              </div>
              <Link to={`/teams/${teamId}/settings`}>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-8 mb-6">
                <TabsTrigger value="feed" className="gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="roster" className="gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Roster</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </TabsTrigger>
                <TabsTrigger value="workouts" className="gap-1.5">
                  <Dumbbell className="w-4 h-4" />
                  <span className="hidden sm:inline">Workouts</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-1.5">
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="playbook" className="gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Playbook</span>
                </TabsTrigger>
                <TabsTrigger value="drive5" className="gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span className="hidden sm:inline">Drive 5</span>
                </TabsTrigger>
                <TabsTrigger value="depthchart" className="gap-1.5">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Depth</span>
                </TabsTrigger>
              </TabsList>

              <div>
                <TabsContent value="feed" className="mt-0">
                  <div className="space-y-6">
                    {user && <CreatePostForm />}
                    <PostsFeed />
                  </div>
                </TabsContent>

                <TabsContent value="roster" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button onClick={() => { setDefaultRole('player'); setAddMemberOpen(true); }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Player
                      </Button>
                      <Button variant="outline" onClick={() => { setDefaultRole('coach'); setAddMemberOpen(true); }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Coach
                      </Button>
                      <Button variant="outline" onClick={() => { setDefaultRole('parent'); setAddMemberOpen(true); }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Parent
                      </Button>
                    </div>
                    
                    <TeamRoster 
                      members={members} 
                      isLoading={membersLoading} 
                      isCoach={isCoach} 
                      onRemoveMember={removeMember}
                      onEditMember={(memberId, players, legacyUpdate) => {
                        editMemberPlayers({ memberId, players, legacyUpdate });
                      }}
                      isEditing={isEditingPlayers}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="schedule" className="mt-0">
                  <TeamSchedule teamId={teamId!} isCoach={isCoach} />
                </TabsContent>
                
                <TabsContent value="workouts" className="mt-0">
                  <TeamWorkoutsContent />
                </TabsContent>
                
                <TabsContent value="videos" className="mt-0">
                  <TeamVideosContent />
                </TabsContent>
                
                <TabsContent value="playbook" className="mt-0">
                  <TeamPlaybookContent />
                </TabsContent>

                <TabsContent value="drive5" className="mt-0">
                  <Drive5Dashboard teamId={teamId} />
                </TabsContent>

                <TabsContent value="depthchart" className="mt-0">
                  <DepthChart teamId={teamId!} members={members} isCoach={isCoach} teamName={team?.name} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />

      <AddMemberForm
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        teamId={teamId!}
        defaultRole={defaultRole}
        onMemberAdded={refetchMembers}
      />
    </div>
  );
};

export default TeamAdmin;
