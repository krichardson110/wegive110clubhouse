import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Users, UserCheck, Baby, Shield, 
  ChevronDown, ChevronUp, Trash2, RefreshCw, Mail, Eye
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TeamMemberCounts {
  total: number;
  coaches: number;
  players: number;
  parents: number;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  age_group: string | null;
  season: string | null;
  created_at: string;
  member_counts: TeamMemberCounts;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  player_name: string | null;
  player_number: string | null;
  position: string | null;
  parent_email: string | null;
  status: string;
  email: string | null;
  last_sign_in_at: string | null;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PendingInvitation {
  id: string;
  email: string;
  player_name: string | null;
  invite_type: string;
  expires_at: string;
}

interface TeamDetails {
  team: Team;
  members: TeamMember[];
  pending_invitations: PendingInvitation[];
}

const TeamManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/teams`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId: string) => {
    setLoadingDetails(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/teams/${teamId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamDetails(data);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team details',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleExpandTeam = (teamId: string) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
      setTeamDetails(null);
    } else {
      setExpandedTeam(teamId);
      fetchTeamDetails(teamId);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/teams/${selectedTeam.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Team Deleted',
          description: `${selectedTeam.name} has been deleted.`,
        });
        fetchTeams();
        setExpandedTeam(null);
        setTeamDetails(null);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete team');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember || !expandedTeam) return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/teams/${expandedTeam}/members/${selectedMember.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Member Removed',
          description: `${selectedMember.player_name || selectedMember.email} has been removed.`,
        });
        fetchTeamDetails(expandedTeam);
        fetchTeams();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setShowRemoveMemberDialog(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'coach':
        return <Badge className="bg-primary/20 text-primary border-primary/30"><Shield className="w-3 h-3 mr-1" />Coach</Badge>;
      case 'player':
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Player</Badge>;
      case 'parent':
        return <Badge variant="outline"><Baby className="w-3 h-3 mr-1" />Parent</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">All Teams ({teams.length})</h3>
          <p className="text-sm text-muted-foreground">Click on a team to view members</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTeams}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No teams have been created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <Collapsible
              key={team.id}
              open={expandedTeam === team.id}
              onOpenChange={() => handleExpandTeam(team.id)}
            >
              <Card className={expandedTeam === team.id ? 'border-primary' : ''}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{team.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {team.age_group && <Badge variant="outline" className="text-xs">{team.age_group}</Badge>}
                            {team.season && <span className="text-xs">{team.season}</span>}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            {team.member_counts.coaches}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {team.member_counts.players}
                          </span>
                          <span className="flex items-center gap-1">
                            <Baby className="w-4 h-4" />
                            {team.member_counts.parents}
                          </span>
                        </div>
                        {expandedTeam === team.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="border-t">
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : teamDetails ? (
                      <div className="space-y-6 pt-4">
                        {/* Team Actions */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Created {formatDate(team.created_at)}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                          </Button>
                        </div>

                        {/* Members Table */}
                        <div>
                          <h4 className="font-medium mb-3">Team Members ({teamDetails.members.length})</h4>
                          <div className="rounded-lg border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>Details</TableHead>
                                  <TableHead>Last Sign In</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {teamDetails.members.map((member) => (
                                  <TableRow key={member.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">
                                          {member.player_name || member.profile?.display_name || 'No name'}
                                        </p>
                                        {member.player_number && (
                                          <p className="text-xs text-muted-foreground">#{member.player_number}</p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {member.email || member.parent_email || 'N/A'}
                                    </TableCell>
                                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {member.position || '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {formatDate(member.last_sign_in_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedMember(member);
                                          setShowRemoveMemberDialog(true);
                                        }}
                                        className="text-destructive hover:text-destructive"
                                        title="Remove from team"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {teamDetails.members.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                      No members in this team
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Pending Invitations */}
                        {teamDetails.pending_invitations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Pending Invitations ({teamDetails.pending_invitations.length})
                            </h4>
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Player Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Expires</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {teamDetails.pending_invitations.map((invite) => (
                                    <TableRow key={invite.id}>
                                      <TableCell>{invite.email}</TableCell>
                                      <TableCell>{invite.player_name || '—'}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{invite.invite_type}</Badge>
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(invite.expires_at)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Delete Team Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedTeam?.name}</strong>? 
              This will remove all team members and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedMember?.player_name || selectedMember?.email}</strong> from this team?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveMemberDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
