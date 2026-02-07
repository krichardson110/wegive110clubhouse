import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Shield, Users, Activity, MessageSquare, 
  Search, RefreshCw, Key, Mail, Trash2, Eye,
  LogOut, Home, ChevronLeft, ChevronRight
} from 'lucide-react';
import clubhouseLogo from '@/assets/clubhouse-logo.png';

interface UserData {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_super_admin: boolean;
  user_type: string;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  team_memberships: Array<{
    team_id: string;
    role: string;
    status: string;
    teams: { name: string };
  }>;
}

interface PlatformStats {
  total_users: number;
  total_teams: number;
  total_training_logs: number;
  total_posts: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const perPage = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      // Fetch users
      const usersResponse = await supabase.functions.invoke('admin-api', {
        headers,
        body: null,
        method: 'GET',
      });

      // Use fetch directly for proper query params
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/users?page=${page}&per_page=${perPage}&search=${encodeURIComponent(searchQuery)}`, {
          headers,
        }),
        fetch(`${baseUrl}/stats`, { headers }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        setTotalUsers(usersData.total || 0);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Password Reset Link Generated',
          description: 'Copy the link to send to the user.',
        });
        // Copy link to clipboard
        if (data.reset_link) {
          navigator.clipboard.writeText(data.reset_link);
          toast({
            title: 'Link Copied',
            description: 'Password reset link copied to clipboard.',
          });
        }
      } else {
        throw new Error(data.error || 'Failed to generate reset link');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setShowResetDialog(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword) return;
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/users/${selectedUser.id}/update-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Password Updated',
          description: `Password for ${selectedUser.email} has been updated.`,
        });
      } else {
        throw new Error(data.error || 'Failed to update password');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setShowPasswordDialog(false);
      setNewPassword('');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'User Deleted',
          description: `${selectedUser.email} has been deleted.`,
        });
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to delete user');
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(totalUsers / perPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={clubhouseLogo} alt="Clubhouse" className="h-10 w-auto" />
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Admin Portal</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Main Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_users}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_teams}</p>
                    <p className="text-sm text-muted-foreground">Teams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_training_logs}</p>
                    <p className="text-sm text-muted-foreground">Training Logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_posts}</p>
                    <p className="text-sm text-muted-foreground">Community Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Teams</TableHead>
                        <TableHead>Email Verified</TableHead>
                        <TableHead>Last Sign In</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{u.profile?.display_name || 'No name'}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={u.is_super_admin ? 'default' : 'secondary'}
                              className={u.is_super_admin ? 'bg-primary' : ''}
                            >
                              {u.user_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {u.team_memberships.slice(0, 2).map((tm, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tm.teams?.name || 'Unknown'}
                                </Badge>
                              ))}
                              {u.team_memberships.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{u.team_memberships.length - 2}
                                </Badge>
                              )}
                              {u.team_memberships.length === 0 && (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.email_confirmed_at ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(u.last_sign_in_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(u.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowResetDialog(true);
                                }}
                                title="Generate Reset Link"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowPasswordDialog(true);
                                }}
                                title="Set New Password"
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              {!u.is_super_admin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setShowDeleteDialog(true);
                                  }}
                                  title="Delete User"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalUsers)} of {totalUsers} users
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Password Reset Link</DialogTitle>
            <DialogDescription>
              Generate a password reset link for {selectedUser?.email}. 
              The link will be copied to your clipboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set New Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false);
              setNewPassword('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword} disabled={actionLoading || newPassword.length < 6}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.email}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
