import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Loader2, Search, RefreshCw, Clock, FileText, User, Play, BookOpen, Award, Activity, ChevronLeft, ChevronRight, ArrowLeft, MessageSquare, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  user_id: string;
  page_path: string;
  page_title: string | null;
  time_spent_seconds: number;
  visited_at: string;
  left_at: string | null;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
}

interface UserActivitySummary {
  user_id: string;
  display_name: string | null;
  total_visits: number;
  total_time_seconds: number;
  most_visited_page: string;
  last_activity: string;
}

interface EngagementData {
  summary: {
    total_watch_time_seconds: number;
    unique_workouts_watched: number;
    total_exercise_time_seconds: number;
    exercises_completed: number;
    unique_chapters_engaged: number;
    total_page_time_seconds: number;
    total_page_visits: number;
    badges_earned: number;
    drive5_checkins: number;
    training_logs_count: number;
    posts_count: number;
  };
  watch_sessions: any[];
  exercise_responses: any[];
  activity_logs: any[];
  badges: any[];
  checkins: any[];
  training_logs: any[];
  posts: any[];
}

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 1) return '0s';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const LOGS_PER_PAGE = 50;

const ActivityLogsManager = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [logPage, setLogPage] = useState(1);

  // Fetch all activity logs for summary
  const { data: activityLogs = [], isLoading: logsLoading, refetch } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data as ActivityLog[];
    },
  });

  // Fetch user profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name');
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch engagement data when a user is selected
  const { data: engagementData, isLoading: engagementLoading } = useQuery<EngagementData>({
    queryKey: ['admin-user-engagement', selectedUserId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${baseUrl}/users/${selectedUserId}/engagement`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch engagement data');
      return response.json();
    },
    enabled: !!selectedUserId,
  });

  const profileMap = new Map(profiles.map(p => [p.user_id, p]));

  // Compute user activity summaries
  const userSummaries: UserActivitySummary[] = (() => {
    const summaryMap = new Map<string, UserActivitySummary>();
    activityLogs.forEach(log => {
      const existing = summaryMap.get(log.user_id);
      const profile = profileMap.get(log.user_id);
      if (!existing) {
        summaryMap.set(log.user_id, {
          user_id: log.user_id,
          display_name: profile?.display_name || null,
          total_visits: 1,
          total_time_seconds: log.time_spent_seconds || 0,
          most_visited_page: log.page_title || log.page_path,
          last_activity: log.visited_at,
        });
      } else {
        existing.total_visits += 1;
        existing.total_time_seconds += log.time_spent_seconds || 0;
        if (new Date(log.visited_at) > new Date(existing.last_activity)) {
          existing.last_activity = log.visited_at;
        }
      }
    });
    return Array.from(summaryMap.values())
      .sort((a, b) => b.total_time_seconds - a.total_time_seconds);
  })();

  const filteredSummaries = userSummaries.filter(s =>
    (s.display_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    s.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Page statistics
  const pageStats = (() => {
    const stats = new Map<string, { visits: number; totalTime: number }>();
    activityLogs.forEach(log => {
      const page = log.page_title || log.page_path;
      const existing = stats.get(page);
      if (!existing) {
        stats.set(page, { visits: 1, totalTime: log.time_spent_seconds || 0 });
      } else {
        existing.visits += 1;
        existing.totalTime += log.time_spent_seconds || 0;
      }
    });
    return Array.from(stats.entries())
      .map(([page, data]) => ({ page, ...data }))
      .sort((a, b) => b.visits - a.visits);
  })();

  // Pagination for engagement activity logs
  const engagementLogs = engagementData?.activity_logs || [];
  const totalLogPages = Math.ceil(engagementLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = engagementLogs.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);

  const handleViewDetails = (userId: string, displayName: string | null) => {
    setSelectedUserId(userId);
    setSelectedUserName(displayName || 'Unknown User');
    setLogPage(1);
  };

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => {
    if (totalPages <= 1) return null;
    
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === currentPage}
                  onClick={() => onPageChange(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (logsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Detail view for a selected user
  if (selectedUserId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Summary
          </Button>
          <h2 className="text-xl font-bold">{selectedUserName}'s Engagement</h2>
        </div>

        {engagementLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : engagementData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Workouts</span>
                  </div>
                  <p className="text-lg font-bold">{engagementData.summary.unique_workouts_watched}</p>
                  <p className="text-xs text-muted-foreground">{formatDuration(engagementData.summary.total_watch_time_seconds)} watched</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Playbook</span>
                  </div>
                  <p className="text-lg font-bold">{engagementData.summary.exercises_completed}</p>
                  <p className="text-xs text-muted-foreground">{engagementData.summary.unique_chapters_engaged} chapters</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Page Visits</span>
                  </div>
                  <p className="text-lg font-bold">{engagementData.summary.total_page_visits}</p>
                  <p className="text-xs text-muted-foreground">{formatDuration(engagementData.summary.total_page_time_seconds)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Badges</span>
                  </div>
                  <p className="text-lg font-bold">{engagementData.summary.badges_earned}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Training</span>
                  </div>
                  <p className="text-lg font-bold">{engagementData.summary.training_logs_count}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Posts</span>
                  </div>
                  <p className="text-lg font-bold">{engagementData.summary.posts_count}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabbed Detail View */}
            <Tabs defaultValue="activity" className="space-y-4">
              <TabsList>
                <TabsTrigger value="activity">Activity Logs</TabsTrigger>
                <TabsTrigger value="workouts">Workouts Watched</TabsTrigger>
                <TabsTrigger value="playbook">Playbook Progress</TabsTrigger>
                <TabsTrigger value="training">Training Logs</TabsTrigger>
              </TabsList>

              {/* Activity Logs Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Page Activity</CardTitle>
                    <CardDescription>
                      {engagementLogs.length} total visits • Showing page {logPage} of {totalLogPages || 1}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead>Time Spent</TableHead>
                          <TableHead>Visited</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedLogs.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{log.page_title || log.page_path}</Badge>
                                <span className="text-xs text-muted-foreground">{log.page_path}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">{formatDuration(log.time_spent_seconds || 0)}</span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(log.visited_at), 'MMM d, h:mm a')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {paginatedLogs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              No activity logs found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {renderPagination(logPage, totalLogPages, setLogPage)}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Workouts Tab */}
              <TabsContent value="workouts">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Workouts Watched</CardTitle>
                    <CardDescription>
                      {engagementData.watch_sessions.length} sessions • {formatDuration(engagementData.summary.total_watch_time_seconds)} total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Workout</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Watched</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engagementData.watch_sessions.map((session: any) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">
                              {session.workouts?.title || 'Unknown Workout'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {session.workouts?.workout_categories?.name || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {formatDuration(session.duration_seconds || 0)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(session.started_at), 'MMM d, h:mm a')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {engagementData.watch_sessions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No workouts watched yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Playbook Tab */}
              <TabsContent value="playbook">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Playbook Progress</CardTitle>
                    <CardDescription>
                      {engagementData.summary.exercises_completed} exercises completed across {engagementData.summary.unique_chapters_engaged} chapters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Journey</TableHead>
                          <TableHead>Chapter</TableHead>
                          <TableHead>Time Spent</TableHead>
                          <TableHead>Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engagementData.exercise_responses.map((response: any) => (
                          <TableRow key={response.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {response.chapters?.journeys?.title || 'Unknown Journey'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {response.chapters?.title || 'Unknown Chapter'}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {formatDuration(response.time_spent_seconds || 0)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(response.completed_at), 'MMM d, h:mm a')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {engagementData.exercise_responses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No playbook exercises completed yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Training Logs Tab */}
              <TabsContent value="training">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Training Logs</CardTitle>
                    <CardDescription>
                      {engagementData.training_logs.length} training sessions logged
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Logged</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engagementData.training_logs.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.title}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {log.duration_minutes ? `${log.duration_minutes}m` : '—'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(log.logged_at), 'MMM d, h:mm a')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {engagementData.training_logs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              No training logs found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    );
  }

  // Summary view
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
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userSummaries.length}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activityLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Page Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatDuration(activityLogs.reduce((sum, l) => sum + (l.time_spent_seconds || 0), 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Time Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Pages</CardTitle>
          <CardDescription>Most visited pages across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pageStats.slice(0, 8).map(({ page, visits, totalTime }) => (
              <Badge key={page} variant="secondary" className="text-sm py-1.5 px-3">
                {page}: {visits} visits ({formatDuration(totalTime)})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Summary</CardTitle>
          <CardDescription>Click "View Details" to see full engagement data for any user</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Total Visits</TableHead>
                <TableHead>Time Spent</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSummaries.map((summary) => (
                <TableRow key={summary.user_id}>
                  <TableCell>
                    <p className="font-medium">{summary.display_name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">{summary.user_id.slice(0, 8)}...</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{summary.total_visits} pages</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{formatDuration(summary.total_time_seconds)}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(summary.last_activity), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(summary.user_id, summary.display_name)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSummaries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No activity data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogsManager;
