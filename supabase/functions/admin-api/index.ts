import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPER_ADMIN_EMAIL = 'krichardson@wegive110.com';

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
    const userEmail = claims.claims.email;
    console.log(`[admin-api] Authenticated user: ${userId}, email: ${userEmail}`);

    // Verify super admin status
    if (userEmail !== SUPER_ADMIN_EMAIL) {
      console.log('[admin-api] User is not super admin');
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // GET /users - List all users with their profiles and team memberships
    if ((path === '/users' || path === '' || path === '/') && req.method === 'GET') {
      console.log('[admin-api] Fetching all users');
      
      const page = parseInt(url.searchParams.get('page') || '1');
      const perPage = parseInt(url.searchParams.get('per_page') || '50');
      const search = url.searchParams.get('search') || '';

      // Get users from auth.users using admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: perPage,
      });

      if (authError) {
        console.error('[admin-api] Error fetching users:', authError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users', details: authError.message }),
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

      // Combine data - use email username as fallback display name
      let enrichedUsers = users.map(user => {
        const profile = profileMap.get(user.id);
        const userMemberships = membershipMap.get(user.id) || [];
        // Try to get display name from: profile, team_member.player_name, or email prefix
        const displayName = profile?.display_name 
          || userMemberships.find(m => m.player_name)?.player_name
          || user.email?.split('@')[0] 
          || null;
        
        return {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          is_super_admin: user.email === SUPER_ADMIN_EMAIL,
          profile: profile ? { ...profile, display_name: displayName } : { display_name: displayName },
          team_memberships: userMemberships,
          user_type: user.email === SUPER_ADMIN_EMAIL 
            ? 'Super Admin' 
            : (userMemberships.some(m => m.role === 'coach') ? 'Coach' : 'Player')
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
            is_super_admin: user.email === SUPER_ADMIN_EMAIL,
            user_type: user.email === SUPER_ADMIN_EMAIL 
              ? 'Super Admin' 
              : (memberships?.some(m => m.role === 'coach') ? 'Coach' : 'Player'),
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
      console.log(`[admin-api] Sending password reset for user: ${targetUserId}`);

      // Get user email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

      if (userError || !userData.user?.email) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate password reset link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: userData.user.email,
      });

      if (linkError) {
        console.error('[admin-api] Error generating reset link:', linkError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate reset link', details: linkError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Password reset link generated');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset link generated',
          reset_link: linkData.properties?.action_link
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /users/:userId/update-password - Directly update user password
    const updatePasswordMatch = path.match(/^\/users\/([a-f0-9-]+)\/update-password$/);
    if (updatePasswordMatch && req.method === 'POST') {
      const targetUserId = updatePasswordMatch[1];
      console.log(`[admin-api] Updating password for user: ${targetUserId}`);

      const body = await req.json();
      const { password } = body;

      if (!password || password.length < 6) {
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
          JSON.stringify({ error: 'Failed to update password', details: updateError.message }),
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
      console.log(`[admin-api] Deleting user: ${targetUserId}`);

      // Prevent deleting super admin
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      if (userData?.user?.email === SUPER_ADMIN_EMAIL) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete super admin account' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

      if (deleteError) {
        console.error('[admin-api] Error deleting user:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user', details: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] User deleted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'User deleted successfully' }),
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
      console.log(`[admin-api] Deleting team: ${teamId}`);

      const { error: deleteError } = await supabaseAdmin
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (deleteError) {
        console.error('[admin-api] Error deleting team:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete team', details: deleteError.message }),
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
          JSON.stringify({ error: 'Failed to remove member', details: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-api] Member removed successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Member removed successfully' }),
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
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
