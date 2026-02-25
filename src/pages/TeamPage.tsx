import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTeam, useTeamMembers } from "@/hooks/useTeams";
import TeamRoster from "@/components/teams/TeamRoster";
import AddMemberForm from "@/components/teams/AddMemberForm";
import CreatePostForm from "@/components/community/CreatePostForm";
import PostsFeed from "@/components/community/PostsFeed";
import TeamSchedule from "@/components/teams/TeamSchedule";
import TeamWorkoutsContent from "@/components/teams/TeamWorkoutsContent";
import TeamVideosContent from "@/components/teams/TeamVideosContent";
import TeamPlaybookContent from "@/components/teams/TeamPlaybookContent";
import TeamPracticesContent from "@/components/teams/TeamPracticesContent";
import Drive5Dashboard from "@/components/drive5/Drive5Dashboard";
import Revive5Dashboard from "@/components/revive5/Revive5Dashboard";
import DepthChart from "@/components/teams/DepthChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trophy, UserPlus, Users, MessageSquare, Calendar, Settings, Dumbbell, Video, BookOpen, Clipboard, Flame, ClipboardList, LayoutGrid, Heart } from "lucide-react";

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const { team, isLoading: teamLoading, isCoach, isMember } = useTeam(teamId);
  const { members, isLoading: membersLoading, removeMember, refetch: refetchMembers } = useTeamMembers(teamId);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [defaultRole, setDefaultRole] = useState<'player' | 'parent' | 'coach'>('player');
  const [activeTab, setActiveTab] = useState("feed");

  if (teamLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!team || !isMember) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This team doesn't exist or you don't have access.
            </p>
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
        {/* Team Header */}
        <section className="py-6 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/20 text-primary">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">
                    {team.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    {team.age_group && <span>{team.age_group}</span>}
                    {team.age_group && team.season && <span>•</span>}
                    {team.season && <span>{team.season}</span>}
                  </div>
                </div>
              </div>
              
              {isCoach && (
                <Link to={`/teams/${teamId}/settings`}>
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-10 mb-6">
                <TabsTrigger value="feed" className="gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="drive5" className="gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span className="hidden sm:inline">Drive 5</span>
                </TabsTrigger>
                <TabsTrigger value="revive5" className="gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Revive 5</span>
                </TabsTrigger>
                <TabsTrigger value="roster" className="gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Roster</span>
                </TabsTrigger>
                <TabsTrigger value="depthchart" className="gap-1.5">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Depth</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </TabsTrigger>
                <TabsTrigger value="practices" className="gap-1.5">
                  <ClipboardList className="w-4 h-4" />
                  <span className="hidden sm:inline">Practices</span>
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
              </TabsList>

              <TabsContent value="feed">
                <div className="space-y-6">
                  {user && <CreatePostForm />}
                  <PostsFeed />
                </div>
              </TabsContent>

              <TabsContent value="drive5">
                <Drive5Dashboard teamId={teamId} />
              </TabsContent>

              <TabsContent value="roster" className="space-y-4">
                {isCoach && (
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
                )}
                <TeamRoster
                  members={members}
                  isLoading={membersLoading}
                  isCoach={isCoach}
                  onRemoveMember={removeMember}
                />
              </TabsContent>

              <TabsContent value="schedule">
                <TeamSchedule isCoach={isCoach} teamId={teamId} />
              </TabsContent>

              <TabsContent value="practices">
                <TeamPracticesContent teamId={teamId!} isCoach={isCoach} />
              </TabsContent>

              <TabsContent value="workouts">
                <TeamWorkoutsContent />
              </TabsContent>

              <TabsContent value="videos">
                <TeamVideosContent />
              </TabsContent>

              <TabsContent value="playbook">
                <TeamPlaybookContent />
              </TabsContent>

              <TabsContent value="revive5">
                <Revive5Dashboard teamId={teamId} />
              </TabsContent>

              <TabsContent value="depthchart">
                <DepthChart teamId={teamId!} members={members} isCoach={isCoach} />
              </TabsContent>
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

export default TeamPage;
