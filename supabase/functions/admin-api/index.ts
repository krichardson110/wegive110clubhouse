import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Input validation helpers
function validatePositiveInt(value: string | null, defaultValue: number, max?: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return defaultValue;
  if (max && parsed > max) return max;
  return parsed;
}

function isValidUUID(value: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);
}

const VALID_ROLES = ['super_admin', 'admin', 'coach', 'player', 'parent', 'user'];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/admin-api', '');
    
    console.log(`[admin-api] Request: ${req.method} ${path}`);

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[admin-api] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth context for verification
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claims?.claims) {
      console.log('[admin-api] Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub;
    console.log(`[admin-api] Authenticated user: ${userId}`);

    // Create admin client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify admin status using user_roles table
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['super_admin', 'admin']);

    if (roleError || !roleData || roleData.length === 0) {
      console.log('[admin-api] User does not have admin role:', roleError?.message);
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isSuperAdmin = roleData.some(r => r.role === 'super_admin');
    console.log(`[admin-api] User is admin, super_admin: ${isSuperAdmin}`);

    // GET /users - List all users with their profiles and team memberships
    if ((path === '/users' || path === '' || path === '/') && req.method === 'GET') {
      console.log('[admin-api] Fetching all users');
      
      const page = validatePositiveInt(url.searchParams.get('page'), 1);
      const perPage = validatePositiveInt(url.searchParams.get('per_page'), 50, 100);
      const search = (url.searchParams.get('search') || '').trim().slice(0, 200);

      // Get users from auth.users using admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: perPage,
      });

      if (authError) {
        console.error('[admin-api] Error fetching users:', authError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const users = authData.users || [];
      const userIds = users.map(u => u.id);
      
      console.log(`[admin-api] Found ${users.length} auth users:`, users.map(u => ({ id: u.id, email: u.email })));

      // Get profiles for all users
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Get team memberships for all users
      const { data: memberships } = await supabaseAdmin
        .from('team_members')
        .select('user_id, team_id, role, status, player_name, teams(name)')
        .in('user_id', userIds);

      const membershipMap = new Map<string, any[]>();
      memberships?.forEach(m => {
        if (!membershipMap.has(m.user_id)) {
          membershipMap.set(m.user_id, []);
        }
        membershipMap.get(m.user_id)?.push(m);
      });

      // Get user roles
      const { data: userRolesData } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const userRolesMap = new Map<string, string[]>();
      userRolesData?.forEach(r => {
        if (!userRolesMap.has(r.user_id)) {
          userRolesMap.set(r.user_id, []);
        }
        userRolesMap.get(r.user_id)?.push(r.role);
      });

      // Combine data - use email username as fallback display name
      let enrichedUsers = users.map(user => {
        const profile = profileMap.get(user.id);
        const userMemberships = membershipMap.get(user.id) || [];
        const roles = userRolesMap.get(user.id) || [];
        // Try to get display name from: profile, team_member.player_name, or email prefix
        const displayName = profile?.display_name 
          || userMemberships.find(m => m.player_name)?.player_name
          || user.email?.split('@')[0] 
          || null;
        
        const isSuperAdminUser = roles.includes('super_admin');
        
        return {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          is_super_admin: isSuperAdminUser,
          roles: roles,
          profile: profile ? { ...profile, display_name: displayName } : { display_name: displayName },
          team_memberships: userMemberships,
          user_type: isSuperAdminUser
            ? 'Super Admin' 
            : (roles.includes('admin') ? 'Admin' : (userMemberships.some(m => m.role === 'coach') ? 'Coach' : 'Player'))
        };
      });

      // Filter by search if provided
      if (search) {
        const searchLower = search.toLowerCase();
        enrichedUsers = enrichedUsers.filter(u => 
          u.email?.toLowerCase().includes(searchLower) ||
          u.profile?.display_name?.toLowerCase().includes(searchLower)
        );
      }

      // Get pending invitations count for context
      const { count: pendingInvites } = await supabaseAdmin
        .from('team_invitations')
        .select('id', { count: 'exact', head: true })
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      console.log(`[admin-api] Returning ${enrichedUsers.length} users, ${pendingInvites || 0} pending invites`);
      return new Response(
        JSON.stringify({ 
          users: enrichedUsers,
          total: authData.total || users.length,
          pending_invitations: pendingInvites || 0,
          page,
          per_page: perPage
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /users/:userId - Get specific user details
    const userMatch = path.match(/^\/users\/([a-f0-9-]+)$/);
    if (userMatch && req.method === 'GET') {
      const targetUserId = userMatch[1];
      if (!isValidUUID(targetUserId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid user ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Fetching user: ${targetUserId}`);

      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

      if (userError || !userData.user) {
        console.error('[admin-api] Error fetching user:', userError);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const user = userData.user;

      // Get profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      // Get team memberships
      const { data: memberships } = await supabaseAdmin
        .from('team_members')
        .select('*, teams(*)')
        .eq('user_id', targetUserId);

      // Get training logs count
      const { count: trainingCount } = await supabaseAdmin
        .from('training_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      // Get posts count
      const { count: postsCount } = await supabaseAdmin
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            is_super_admin: false,
            user_type: memberships?.some(m => m.role === 'coach') ? 'Coach' : 'Player',
            profile,
            team_memberships: memberships || [],
            stats: {
              training_logs: trainingCount || 0,
              posts: postsCount || 0
            }
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /users/:userId/reset-password - Send password reset email
    const resetMatch = path.match(/^\/users\/([a-f0-9-]+)\/reset-password$/);
    if (resetMatch && req.method === 'POST') {
      const targetUserId = resetMatch[1];
      if (!isValidUUID(targetUserId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid user ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Sending password reset for user: ${targetUserId}`);

      // Get user email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

      if (userError || !userData.user?.email) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate password reset link with redirect to the app
      const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || '';
      const redirectTo = `${origin}/auth`;
      
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: userData.user.email,
        options: {
          redirectTo,
        },
      });

      if (linkError) {
        console.error('[admin-api] Error generating reset link:', linkError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate reset link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // The action_link from generateLink points to Supabase's domain.
      // We need to construct a proper link that redirects to our app.
      const actionLink = linkData.properties?.action_link || '';
      // The action link contains token_hash and type params - extract and rebuild for our app
      const linkUrl = new URL(actionLink);
      const tokenHash = linkUrl.searchParams.get('token');
      const linkType = linkUrl.searchParams.get('type');
      const hashed_token = linkData.properties?.hashed_token || tokenHash;
      
      // Build a link that goes through Supabase auth verify but redirects to our app
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const resetLink = `${supabaseUrl}/auth/v1/verify?token=${hashed_token}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;
      
      console.log('[admin-api] Password reset link generated');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset link generated',
          reset_link: resetLink,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /users/:userId/update-password - Directly update user password
    const updatePasswordMatch = path.match(/^\/users\/([a-f0-9-]+)\/update-password$/);
    if (updatePasswordMatch && req.method === 'POST') {
      const targetUserId = updatePasswordMatch[1];
      if (!isValidUUID(targetUserId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid user ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Updating password for user: ${targetUserId}`);

      const body = await req.json();
      const { password } = body;

      if (!password || typeof password !== 'string' || password.length < 6 || password.length > 128) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 6 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        password: password
      });

      if (updateError) {
        console.error('[admin-api] Error updating password:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Password updated successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Password updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /users/:userId - Delete a user
    const deleteUserMatch = path.match(/^\/users\/([a-f0-9-]+)$/);
    if (deleteUserMatch && req.method === 'DELETE') {
      const targetUserId = deleteUserMatch[1];
      if (!isValidUUID(targetUserId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid user ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Deleting user: ${targetUserId}`);

      // Only super admins can delete users
      if (!isSuperAdmin) {
        return new Response(
          JSON.stringify({ error: 'Only super admins can delete users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Prevent deleting yourself
      if (targetUserId === userId) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete your own account' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clean up all user data from the database before deleting auth user
      console.log(`[admin-api] Cleaning up data for user: ${targetUserId}`);

      // Get team member IDs for this user (needed for team_member_players and depth_chart)
      const { data: memberRecords } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('user_id', targetUserId);
      const memberIds = memberRecords?.map(m => m.id) || [];

      // Delete in dependency order - child tables first
      const cleanupOps = [
        // Team member related
        ...(memberIds.length > 0 ? [
          supabaseAdmin.from('team_member_players').delete().in('team_member_id', memberIds),
          supabaseAdmin.from('depth_chart').delete().in('team_member_id', memberIds),
        ] : []),
        // Community
        supabaseAdmin.from('comment_likes').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('post_likes').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('post_comments').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('posts').delete().eq('user_id', targetUserId),
        // Team community
        supabaseAdmin.from('team_post_likes').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('team_post_comments').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('team_posts').delete().eq('user_id', targetUserId),
        // Drive 5
        supabaseAdmin.from('task_completions').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('daily_checkins').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('goal_tasks').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('player_goals').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('player_streaks').delete().eq('user_id', targetUserId),
        // Workouts & Videos
        supabaseAdmin.from('workout_favorites').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('video_watch_sessions').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('training_logs').delete().eq('user_id', targetUserId),
        // Playbook
        supabaseAdmin.from('exercise_responses').delete().eq('user_id', targetUserId),
        // Badges & Roles
        supabaseAdmin.from('user_badges').delete().eq('user_id', targetUserId),
        supabaseAdmin.from('user_roles').delete().eq('user_id', targetUserId),
        // Activity
        supabaseAdmin.from('user_activity_logs').delete().eq('user_id', targetUserId),
        // Invitations
        supabaseAdmin.from('team_invitations').delete().eq('invited_by', targetUserId),
      ];

      const cleanupResults = await Promise.all(cleanupOps);
      const cleanupErrors = cleanupResults.filter(r => r.error);
      if (cleanupErrors.length > 0) {
        console.error('[admin-api] Some cleanup errors (continuing):', cleanupErrors.map(r => r.error?.message));
      }

      // Delete team memberships
      await supabaseAdmin.from('team_members').delete().eq('user_id', targetUserId);

      // Delete teams created by this user (only if no other members)
      const { data: ownedTeams } = await supabaseAdmin
        .from('teams')
        .select('id')
        .eq('created_by', targetUserId);

      if (ownedTeams && ownedTeams.length > 0) {
        for (const team of ownedTeams) {
          const { count } = await supabaseAdmin
            .from('team_members')
            .select('id', { count: 'exact', head: true })
            .eq('team_id', team.id)
            .eq('status', 'active');

          if (!count || count === 0) {
            // No active members left, safe to delete team
            await supabaseAdmin.from('team_invitations').delete().eq('team_id', team.id);
            await supabaseAdmin.from('team_events').delete().eq('team_id', team.id);
            await supabaseAdmin.from('depth_chart').delete().eq('team_id', team.id);
            await supabaseAdmin.from('schedule_events').delete().eq('team_id', team.id);
            await supabaseAdmin.from('teams').delete().eq('id', team.id);
          }
        }
      }

      // Delete profile
      await supabaseAdmin.from('profiles').delete().eq('user_id', targetUserId);

      // Finally delete the auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

      if (deleteError) {
        console.error('[admin-api] Error deleting auth user:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] User and all associated data deleted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'User and all associated data deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /stats - Get platform statistics
    if (path === '/stats' && req.method === 'GET') {
      console.log('[admin-api] Fetching platform stats');

      const [
        { count: totalUsers },
        { count: totalTeams },
        { count: totalTrainingLogs },
        { count: totalPosts }
      ] = await Promise.all([
        supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 }).then(r => ({ count: r.data?.total || 0 })),
        supabaseAdmin.from('teams').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('training_logs').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('posts').select('id', { count: 'exact', head: true })
      ]);

      return new Response(
        JSON.stringify({
          stats: {
            total_users: totalUsers,
            total_teams: totalTeams,
            total_training_logs: totalTrainingLogs,
            total_posts: totalPosts
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /teams - List all teams with member counts
    if (path === '/teams' && req.method === 'GET') {
      console.log('[admin-api] Fetching all teams');

      const { data: teams, error: teamsError } = await supabaseAdmin
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) {
        console.error('[admin-api] Error fetching teams:', teamsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch teams' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get member counts and coach info for each team
      const teamsWithDetails = await Promise.all((teams || []).map(async (team) => {
        const { data: members } = await supabaseAdmin
          .from('team_members')
          .select('id, role, status')
          .eq('team_id', team.id)
          .eq('status', 'active');

        const coaches = members?.filter(m => m.role === 'coach').length || 0;
        const players = members?.filter(m => m.role === 'player').length || 0;
        const parents = members?.filter(m => m.role === 'parent').length || 0;

        return {
          ...team,
          member_counts: {
            total: members?.length || 0,
            coaches,
            players,
            parents
          }
        };
      }));

      console.log(`[admin-api] Found ${teamsWithDetails.length} teams`);
      return new Response(
        JSON.stringify({ teams: teamsWithDetails }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /teams/:teamId - Get team details with full roster
    const teamDetailMatch = path.match(/^\/teams\/([a-f0-9-]+)$/);
    if (teamDetailMatch && req.method === 'GET') {
      const teamId = teamDetailMatch[1];
      if (!isValidUUID(teamId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid team ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Fetching team details: ${teamId}`);

      // Get team
      const { data: team, error: teamError } = await supabaseAdmin
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError || !team) {
        return new Response(
          JSON.stringify({ error: 'Team not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get all team members
      const { data: members } = await supabaseAdmin
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('role')
        .order('player_name');

      // Get user profiles and emails for all members
      const userIds = members?.map(m => m.user_id) || [];
      
      const [profilesResult, usersResult] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').in('user_id', userIds),
        Promise.all(userIds.map(uid => 
          supabaseAdmin.auth.admin.getUserById(uid).then(r => r.data?.user)
        ))
      ]);

      const profileMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
      const userMap = new Map(usersResult.filter(Boolean).map(u => [u!.id, u]));

      const enrichedMembers = (members || []).map(member => ({
        ...member,
        profile: profileMap.get(member.user_id) || null,
        email: userMap.get(member.user_id)?.email || null,
        last_sign_in_at: userMap.get(member.user_id)?.last_sign_in_at || null
      }));

      // Get pending invitations
      const { data: invitations } = await supabaseAdmin
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      return new Response(
        JSON.stringify({
          team,
          members: enrichedMembers,
          pending_invitations: invitations || []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /teams/:teamId - Delete a team
    const deleteTeamMatch = path.match(/^\/teams\/([a-f0-9-]+)$/);
    if (deleteTeamMatch && req.method === 'DELETE') {
      const teamId = deleteTeamMatch[1];
      if (!isValidUUID(teamId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid team ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Deleting team: ${teamId}`);

      const { error: deleteError } = await supabaseAdmin
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (deleteError) {
        console.error('[admin-api] Error deleting team:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete team' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Team deleted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Team deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /teams/:teamId/members/:memberId - Remove a team member
    const removeMemberMatch = path.match(/^\/teams\/([a-f0-9-]+)\/members\/([a-f0-9-]+)$/);
    if (removeMemberMatch && req.method === 'DELETE') {
      const teamId = removeMemberMatch[1];
      const memberId = removeMemberMatch[2];
      console.log(`[admin-api] Removing member ${memberId} from team ${teamId}`);

      const { error: deleteError } = await supabaseAdmin
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('team_id', teamId);

      if (deleteError) {
        console.error('[admin-api] Error removing member:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to remove member' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Member removed successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Member removed successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /roles - List all user roles
    if (path === '/roles' && req.method === 'GET') {
      console.log('[admin-api] Fetching all user roles');
      
      const { data: rolesData, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('[admin-api] Error fetching roles:', rolesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch roles' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user info for each role
      const userIds = [...new Set(rolesData?.map(r => r.user_id) || [])];
      
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const usersMap = new Map(authData?.users?.map(u => [u.id, u]) || []);

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const enrichedRoles = rolesData?.map(role => {
        const authUser = usersMap.get(role.user_id);
        const profile = profilesMap.get(role.user_id);
        return {
          ...role,
          user_email: authUser?.email,
          user_display_name: profile?.display_name || authUser?.email?.split('@')[0],
        };
      }) || [];

      return new Response(
        JSON.stringify({ roles: enrichedRoles }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /roles - Assign a role to a user
    if (path === '/roles' && req.method === 'POST') {
      const body = await req.json();
      const { email, role } = body;
      
      if (!email || typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return new Response(
          JSON.stringify({ error: 'Valid email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!role || typeof role !== 'string' || !VALID_ROLES.includes(role)) {
        return new Response(
          JSON.stringify({ error: 'Valid role is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[admin-api] Assigning role ${role} to ${email}`);

      // Find user by email
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const targetUser = authData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: 'User not found', message: `No user found with email: ${email}` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert the role
      const { data: insertedRole, error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: targetUser.id,
          role: role,
          granted_by: userId,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'Role already assigned', message: 'This user already has this role' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error('[admin-api] Error inserting role:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to assign role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Role assigned successfully');
      return new Response(
        JSON.stringify({ success: true, role: insertedRole }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /roles/:roleId - Remove a role
    const roleDeleteMatch = path.match(/^\/roles\/([a-f0-9-]+)$/);
    if (roleDeleteMatch && req.method === 'DELETE') {
      const roleId = roleDeleteMatch[1];
      if (!isValidUUID(roleId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid role ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Removing role: ${roleId}`);

      // Don't allow removing own super_admin role
      const { data: roleToDelete } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role')
        .eq('id', roleId)
        .single();

      if (roleToDelete?.user_id === userId && roleToDelete?.role === 'super_admin') {
        return new Response(
          JSON.stringify({ error: 'Cannot remove own super_admin role' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (deleteError) {
        console.error('[admin-api] Error deleting role:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to remove role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Role removed successfully');
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /users/:userId/profile - Update user profile (display name)
    const updateProfileMatch = path.match(/^\/users\/([a-f0-9-]+)\/profile$/);
    if (updateProfileMatch && req.method === 'PUT') {
      const targetUserId = updateProfileMatch[1];
      if (!isValidUUID(targetUserId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid user ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Updating profile for user: ${targetUserId}`);

      const body = await req.json();
      const { display_name, bio } = body;

      if (display_name !== undefined && typeof display_name !== 'string') {
        return new Response(
          JSON.stringify({ error: 'display_name must be a string' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (bio !== undefined && typeof bio !== 'string') {
        return new Response(
          JSON.stringify({ error: 'bio must be a string' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build update object
      const profileUpdate: Record<string, any> = { user_id: targetUserId };
      if (display_name !== undefined) profileUpdate.display_name = display_name?.trim() || null;
      if (bio !== undefined) profileUpdate.bio = bio?.trim() || null;

      // Upsert profile
      const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileUpdate, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('[admin-api] Error updating profile:', upsertError);
        return new Response(
          JSON.stringify({ error: 'Failed to update profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Profile updated successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Profile updated' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /users/:userId/teams - Add user to a team
    const addToTeamMatch = path.match(/^\/users\/([a-f0-9-]+)\/teams$/);
    if (addToTeamMatch && req.method === 'POST') {
      const targetUserId = addToTeamMatch[1];
      if (!isValidUUID(targetUserId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid user ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { team_id, role, player_name } = body;

      if (!team_id || !isValidUUID(team_id)) {
        return new Response(
          JSON.stringify({ error: 'Valid team_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const memberRole = ['coach', 'player', 'parent'].includes(role) ? role : 'player';
      console.log(`[admin-api] Adding user ${targetUserId} to team ${team_id} as ${memberRole}`);

      // Check if already a member
      const { data: existing } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('team_id', team_id)
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'User is already a member of this team' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: newMember, error: insertError } = await supabaseAdmin
        .from('team_members')
        .insert({
          team_id,
          user_id: targetUserId,
          role: memberRole,
          player_name: player_name || null,
          status: 'active',
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('[admin-api] Error adding team member:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to add to team' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Also add to team_member_players if player/parent with a name
      if (player_name && (memberRole === 'player' || memberRole === 'parent')) {
        await supabaseAdmin
          .from('team_member_players')
          .insert({ team_member_id: newMember.id, player_name });
      }

      console.log('[admin-api] User added to team successfully');
      return new Response(
        JSON.stringify({ success: true, member: newMember }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /users/:userId/teams/:teamId - Remove user from a team
    const removeFromTeamMatch = path.match(/^\/users\/([a-f0-9-]+)\/teams\/([a-f0-9-]+)$/);
    if (removeFromTeamMatch && req.method === 'DELETE') {
      const targetUserId = removeFromTeamMatch[1];
      const teamId = removeFromTeamMatch[2];
      if (!isValidUUID(targetUserId) || !isValidUUID(teamId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Removing user ${targetUserId} from team ${teamId}`);

      // Get the team_member record first to clean up players
      const { data: member } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (member) {
        // Delete associated players first
        await supabaseAdmin
          .from('team_member_players')
          .delete()
          .eq('team_member_id', member.id);

        // Delete the membership
        const { error: deleteError } = await supabaseAdmin
          .from('team_members')
          .delete()
          .eq('id', member.id);

        if (deleteError) {
          console.error('[admin-api] Error removing from team:', deleteError);
          return new Response(
            JSON.stringify({ error: 'Failed to remove from team' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.log('[admin-api] User removed from team successfully');
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /users/:userId/engagement - Get user engagement data
    const engagementMatch = path.match(/^\/users\/([a-f0-9-]+)\/engagement$/);
    if (engagementMatch && req.method === 'GET') {
      const targetUserId = engagementMatch[1];
      if (!isValidUUID(targetUserId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid user ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[admin-api] Fetching engagement data for user: ${targetUserId}`);

      const [
        watchSessionsRes,
        exerciseResponsesRes,
        activityLogsRes,
        badgesRes,
        checkinsRes,
        trainingLogsRes,
        postsRes,
      ] = await Promise.all([
        supabaseAdmin
          .from('video_watch_sessions')
          .select('id, workout_id, duration_seconds, started_at, workouts(title, category_id, workout_categories:category_id(name))')
          .eq('user_id', targetUserId)
          .order('started_at', { ascending: false })
          .limit(100),
        supabaseAdmin
          .from('exercise_responses')
          .select('id, chapter_id, exercise_id, time_spent_seconds, completed_at, chapters(title, journey_id, journeys:journey_id(title))')
          .eq('user_id', targetUserId)
          .order('completed_at', { ascending: false })
          .limit(100),
        supabaseAdmin
          .from('user_activity_logs')
          .select('id, page_path, page_title, time_spent_seconds, visited_at, left_at')
          .eq('user_id', targetUserId)
          .order('visited_at', { ascending: false })
          .limit(500),
        supabaseAdmin
          .from('user_badges')
          .select('id, awarded_at, badges(name, icon_name, color_gradient)')
          .eq('user_id', targetUserId),
        supabaseAdmin
          .from('daily_checkins')
          .select('id, checkin_date, completed, category_id, drive5_categories(name)')
          .eq('user_id', targetUserId)
          .order('checkin_date', { ascending: false })
          .limit(30),
        supabaseAdmin
          .from('training_logs')
          .select('id, title, duration_minutes, logged_at')
          .eq('user_id', targetUserId)
          .order('logged_at', { ascending: false })
          .limit(50),
        supabaseAdmin
          .from('posts')
          .select('id, content, likes_count, comments_count, created_at')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      const watchSessions = watchSessionsRes.data || [];
      const exerciseResponses = exerciseResponsesRes.data || [];
      const activityLogs = activityLogsRes.data || [];
      const badges = badgesRes.data || [];
      const checkins = checkinsRes.data || [];
      const trainingLogs = trainingLogsRes.data || [];
      const posts = postsRes.data || [];

      // Compute summary stats
      const totalWatchTime = watchSessions.reduce((s, w) => s + (w.duration_seconds || 0), 0);
      const uniqueWorkouts = new Set(watchSessions.map(w => w.workout_id)).size;
      const totalExerciseTime = exerciseResponses.reduce((s, e) => s + (e.time_spent_seconds || 0), 0);
      const uniqueChapters = new Set(exerciseResponses.map(e => e.chapter_id)).size;
      const totalPageTime = activityLogs.reduce((s, a) => s + (a.time_spent_seconds || 0), 0);
      const completedCheckins = checkins.filter(c => c.completed).length;

      return new Response(
        JSON.stringify({
          summary: {
            total_watch_time_seconds: totalWatchTime,
            unique_workouts_watched: uniqueWorkouts,
            total_exercise_time_seconds: totalExerciseTime,
            exercises_completed: exerciseResponses.length,
            unique_chapters_engaged: uniqueChapters,
            total_page_time_seconds: totalPageTime,
            total_page_visits: activityLogs.length,
            badges_earned: badges.length,
            drive5_checkins: completedCheckins,
            training_logs_count: trainingLogs.length,
            posts_count: posts.length,
          },
          watch_sessions: watchSessions.slice(0, 50),
          exercise_responses: exerciseResponses.slice(0, 50),
          activity_logs: activityLogs,
          badges,
          checkins: checkins.slice(0, 30),
          training_logs: trainingLogs.slice(0, 30),
          posts: posts.slice(0, 10),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route not found
    console.log(`[admin-api] Route not found: ${req.method} ${path}`);
    return new Response(
      JSON.stringify({ error: 'Not found', path }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[admin-api] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
