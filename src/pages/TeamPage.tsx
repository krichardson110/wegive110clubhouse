import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTeam, useTeamMembers } from "@/hooks/useTeams";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import TeamRoster from "@/components/teams/TeamRoster";
import PendingInvitations from "@/components/teams/PendingInvitations";
import InvitePlayerForm from "@/components/teams/InvitePlayerForm";
import CreatePostForm from "@/components/community/CreatePostForm";
import PostsFeed from "@/components/community/PostsFeed";
import TeamSchedule from "@/components/teams/TeamSchedule";
import TeamWorkoutsContent from "@/components/teams/TeamWorkoutsContent";
import TeamVideosContent from "@/components/teams/TeamVideosContent";
import TeamPlaybookContent from "@/components/teams/TeamPlaybookContent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trophy, UserPlus, Users, MessageSquare, Calendar, Settings, Dumbbell, Video, BookOpen, Clipboard } from "lucide-react";

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const { team, isLoading: teamLoading, isCoach, isMember } = useTeam(teamId);
  const { members, isLoading: membersLoading, removeMember, refetch: refetchMembers } = useTeamMembers(teamId);
  const { invitations, createInvitation, deleteInvitation, resendInvitation, isCreating, isResending, refetch: refetchInvitations } = useTeamInvitations(teamId, team?.name);

  const handleInvitationApproved = () => {
    refetchInvitations();
    refetchMembers();
  };
  
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
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
            <h1 className="text-2xl font-bold mb-4">Team not found</h1>
            <p className="text-muted-foreground mb-6">
              This team doesn't exist or you don't have access to it.
            </p>
            <Link to="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInvite = (data: Parameters<typeof createInvitation>[0]) => {
    createInvitation(data, {
      onSuccess: () => {
        // Keep form open to show invite link
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 container mx-auto px-4">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                <div className="flex gap-2">
                  <Link to={`/teams/${teamId}/admin`}>
                    <Button variant="outline">
                      <Clipboard className="w-4 h-4 mr-2" />
                      Manage Team
                    </Button>
                  </Link>
                  <Button onClick={() => setInviteFormOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                  <Link to={`/teams/${teamId}/settings`}>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-2xl grid-cols-6 mb-6">
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
              </TabsList>

              <TabsContent value="feed">
                <div className="space-y-6">
                  {user && <CreatePostForm />}
                  <PostsFeed />
                </div>
              </TabsContent>

              <TabsContent value="roster" className="space-y-4">
                {isCoach && (
                  <PendingInvitations
                    invitations={invitations}
                    onCancel={deleteInvitation}
                    onResend={resendInvitation}
                    isResending={isResending}
                    onApproved={handleInvitationApproved}
                  />
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

              <TabsContent value="workouts">
                <TeamWorkoutsContent />
              </TabsContent>

              <TabsContent value="videos">
                <TeamVideosContent />
              </TabsContent>

              <TabsContent value="playbook">
                <TeamPlaybookContent />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />

      <InvitePlayerForm
        open={inviteFormOpen}
        onOpenChange={setInviteFormOpen}
        onSubmit={handleInvite}
        isLoading={isCreating}
      />
    </div>
  );
};

export default TeamPage;
