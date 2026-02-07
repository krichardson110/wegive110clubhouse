import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Award, Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import BadgeDisplay from '@/components/community/BadgeDisplay';
import type { Badge as BadgeType, UserBadge } from '@/types/community';
import { format } from 'date-fns';

interface UserProfile {
  user_id: string;
  display_name: string | null;
}

const UserBadgeManager = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');

  // Fetch all badges
  const { data: badges = [] } = useQuery({
    queryKey: ['admin-all-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as BadgeType[];
    },
  });

  // Fetch all profiles
  const { data: profiles = [], isLoading: profilesLoading, refetch: refetchProfiles } = useQuery({
    queryKey: ['admin-profiles-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .order('display_name');
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch all user badges
  const { data: userBadges = [], refetch: refetchBadges } = useQuery({
    queryKey: ['admin-user-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .order('awarded_at', { ascending: false });
      if (error) throw error;
      return data as (UserBadge & { badge: BadgeType })[];
    },
  });

  // Award badge mutation
  const awardMutation = useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string }) => {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-badges'] });
      toast.success('Badge awarded successfully!');
      setShowAwardDialog(false);
      setSelectedBadgeId('');
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast.error('User already has this badge');
      } else {
        toast.error('Failed to award badge: ' + error.message);
      }
    },
  });

  // Remove badge mutation
  const removeMutation = useMutation({
    mutationFn: async (userBadgeId: string) => {
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('id', userBadgeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-badges'] });
      toast.success('Badge removed');
    },
    onError: (error) => {
      toast.error('Failed to remove badge: ' + error.message);
    },
  });

  // Create profile lookup
  const profileMap = new Map(profiles.map(p => [p.user_id, p]));

  // Get badges for a specific user
  const getUserBadges = (userId: string) => 
    userBadges.filter(ub => ub.user_id === userId);

  // Filter profiles by search
  const filteredProfiles = profiles.filter(p =>
    (p.display_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Get manual badges only (for awarding)
  const manualBadges = badges.filter(b => b.badge_type === 'manual');

  // Get users who have badges
  const usersWithBadges = [...new Set(userBadges.map(ub => ub.user_id))];

  if (profilesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => { refetchProfiles(); refetchBadges(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        <Badge variant="secondary" className="text-sm">
          <Award className="w-4 h-4 mr-2" />
          {usersWithBadges.length} users have badges
        </Badge>
      </div>

      {/* User List with Badges */}
      <Card>
        <CardHeader>
          <CardTitle>User Badges</CardTitle>
          <CardDescription>Award and manage badges for players</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Badges</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const userBadgeList = getUserBadges(profile.user_id);
                
                return (
                  <TableRow key={profile.user_id}>
                    <TableCell>
                      <p className="font-medium">{profile.display_name || 'Unknown User'}</p>
                      <p className="text-xs text-muted-foreground">{profile.user_id.slice(0, 8)}...</p>
                    </TableCell>
                    <TableCell>
                      {userBadgeList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userBadgeList.map((ub) => (
                            <div 
                              key={ub.id} 
                              className="flex items-center gap-1 group bg-muted/50 rounded-full pr-2"
                            >
                              <BadgeDisplay badge={ub.badge} size="sm" showTooltip />
                              <span className="text-xs text-muted-foreground">
                                {ub.badge.name}
                              </span>
                              <button
                                onClick={() => removeMutation.mutate(ub.id)}
                                className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-destructive/20 rounded-full transition-all"
                                title="Remove badge"
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No badges</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(profile.user_id);
                          setShowAwardDialog(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Award Badge
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProfiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Awards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Badge Awards</CardTitle>
          <CardDescription>Latest badges awarded to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userBadges.slice(0, 10).map((ub) => (
              <div key={ub.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <BadgeDisplay badge={ub.badge} size="md" showTooltip={false} />
                  <div>
                    <p className="font-medium">{profileMap.get(ub.user_id)?.display_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      Awarded {ub.badge.name}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(ub.awarded_at), 'MMM d, yyyy')}
                </span>
              </div>
            ))}
            {userBadges.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No badges have been awarded yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Award Badge Dialog */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Badge</DialogTitle>
            <DialogDescription>
              Award a badge to {profileMap.get(selectedUserId || '')?.display_name || 'this user'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Select value={selectedBadgeId} onValueChange={setSelectedBadgeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a badge to award" />
              </SelectTrigger>
              <SelectContent>
                {manualBadges.map((badge) => {
                  const alreadyHas = userBadges.some(
                    ub => ub.user_id === selectedUserId && ub.badge_id === badge.id
                  );
                  
                  return (
                    <SelectItem 
                      key={badge.id} 
                      value={badge.id}
                      disabled={alreadyHas}
                    >
                      <div className="flex items-center gap-2">
                        <BadgeDisplay badge={badge} size="sm" showTooltip={false} />
                        <span>{badge.name}</span>
                        {alreadyHas && <span className="text-xs text-muted-foreground">(already has)</span>}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {selectedBadgeId && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <BadgeDisplay 
                  badge={badges.find(b => b.id === selectedBadgeId)!} 
                  size="lg" 
                  showTooltip={false} 
                />
                <div>
                  <p className="font-medium">{badges.find(b => b.id === selectedBadgeId)?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {badges.find(b => b.id === selectedBadgeId)?.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAwardDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedUserId && selectedBadgeId) {
                  awardMutation.mutate({ userId: selectedUserId, badgeId: selectedBadgeId });
                }
              }}
              disabled={!selectedBadgeId || awardMutation.isPending}
            >
              {awardMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <Award className="w-4 h-4 mr-2" />
              Award Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserBadgeManager;
