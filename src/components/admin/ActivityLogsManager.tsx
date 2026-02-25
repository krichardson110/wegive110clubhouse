import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, Clock, FileText, User } from 'lucide-react';
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
  email?: string;
  total_visits: number;
  total_time_seconds: number;
  most_visited_page: string;
  last_activity: string;
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const ActivityLogsManager = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'summary' | 'detailed'>('summary');

  // Fetch all activity logs (admin only via RLS)
  const { data: activityLogs = [], isLoading: logsLoading, refetch } = useQuery({
    queryKey: ['admin-activity-logs', selectedUserId],
    queryFn: async () => {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('visited_at', { ascending: false });

      if (selectedUserId) {
        query = query.eq('user_id', selectedUserId).limit(500);
      } else {
        query = query.limit(5000);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLog[];
    },
  });

  // Fetch user profiles for display names
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

  // Create user lookup map
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

    // Sort by total time spent
    return Array.from(summaryMap.values())
      .sort((a, b) => b.total_time_seconds - a.total_time_seconds);
  })();

  // Filter summaries by search
  const filteredSummaries = userSummaries.filter(s => 
    (s.display_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    s.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Page visit statistics
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

  if (logsLoading) {
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
          <Select value={view} onValueChange={(v) => setView(v as 'summary' | 'detailed')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">User Summary</SelectItem>
              <SelectItem value="detailed">Detailed Logs</SelectItem>
            </SelectContent>
          </Select>
          
          {view === 'detailed' && (
            <Select 
              value={selectedUserId || 'all'} 
              onValueChange={(v) => setSelectedUserId(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-60">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {userSummaries.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    {u.display_name || u.user_id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

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

      {/* Page Statistics */}
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
              <div className="p-3 rounded-full bg-green-500/10">
                <Clock className="w-6 h-6 text-green-500" />
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

      {/* Summary View */}
      {view === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle>User Activity Summary</CardTitle>
            <CardDescription>Overview of user engagement across the platform</CardDescription>
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
                        onClick={() => {
                          setSelectedUserId(summary.user_id);
                          setView('detailed');
                        }}
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
      )}

      {/* Detailed View */}
      {view === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Activity Logs</CardTitle>
            <CardDescription>
              {selectedUserId 
                ? `Activity for ${profileMap.get(selectedUserId)?.display_name || 'User'}`
                : 'All user activity'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Visited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.slice(0, 100).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <p className="font-medium">
                        {profileMap.get(log.user_id)?.display_name || 'Unknown'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.page_title || log.page_path}</Badge>
                        <span className="text-xs text-muted-foreground">{log.page_path}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatDuration(log.time_spent_seconds || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.visited_at), 'MMM d, h:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
                {activityLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {activityLogs.length > 100 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Showing 100 of {activityLogs.length} logs
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityLogsManager;
