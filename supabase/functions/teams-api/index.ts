import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TeamMemberResponse {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  player_name: string | null;
  player_number: string | null;
  position: string | null;
  parent_email: string | null;
  status: string;
  joined_at: string | null;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/teams-api', '');
    
    console.log(`[teams-api] Request: ${req.method} ${path}`);

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[teams-api] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claims?.claims) {
      console.log('[teams-api] Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub;
    console.log(`[teams-api] Authenticated user: ${userId}`);

    // Route handling
    // GET /teams - Get all teams for the authenticated user
    if (path === '/teams' || path === '' || path === '/') {
      if (req.method !== 'GET') {
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[teams-api] Fetching teams for user');
      
      // Get team memberships for the user
      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id, role, status')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (membershipError) {
        console.error('[teams-api] Error fetching memberships:', membershipError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch teams', details: membershipError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!memberships || memberships.length === 0) {
        console.log('[teams-api] No teams found for user');
        return new Response(
          JSON.stringify({ teams: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const teamIds = memberships.map(m => m.team_id);
      const roleMap = new Map(memberships.map(m => [m.team_id, m.role]));

      // Get team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (teamsError) {
        console.error('[teams-api] Error fetching teams:', teamsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch team details', details: teamsError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Add user's role to each team
      const teamsWithRole = teams?.map(team => ({
        ...team,
        user_role: roleMap.get(team.id) || 'player'
      })) || [];

      console.log(`[teams-api] Found ${teamsWithRole.length} teams`);
      return new Response(
        JSON.stringify({ teams: teamsWithRole }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /teams/:teamId - Get specific team details
    const teamMatch = path.match(/^\/teams\/([a-f0-9-]+)$/);
    if (teamMatch && req.method === 'GET') {
      const teamId = teamMatch[1];
      console.log(`[teams-api] Fetching team: ${teamId}`);

      // Verify user is a member of this team
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('role, status')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (membershipError) {
        console.error('[teams-api] Error checking membership:', membershipError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify team membership' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!membership) {
        console.log('[teams-api] User is not a member of this team');
        return new Response(
          JSON.stringify({ error: 'Forbidden', message: 'You are not a member of this team' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get team details
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError || !team) {
        console.error('[teams-api] Error fetching team:', teamError);
        return new Response(
          JSON.stringify({ error: 'Team not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[teams-api] Found team: ${team.name}`);
      return new Response(
        JSON.stringify({ team: { ...team, user_role: membership.role } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /teams/:teamId/roster - Get team roster/players
    const rosterMatch = path.match(/^\/teams\/([a-f0-9-]+)\/roster$/);
    if (rosterMatch && req.method === 'GET') {
      const teamId = rosterMatch[1];
      console.log(`[teams-api] Fetching roster for team: ${teamId}`);

      // Verify user is a member of this team
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('role, status')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (membershipError || !membership) {
        console.log('[teams-api] User is not a member of this team');
        return new Response(
          JSON.stringify({ error: 'Forbidden', message: 'You are not a member of this team' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'active')
        .order('role', { ascending: true })
        .order('player_name', { ascending: true });

      if (membersError) {
        console.error('[teams-api] Error fetching roster:', membersError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch roster' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get profiles for all members
      const userIds = members?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Merge profiles with members
      const rosterWithProfiles: TeamMemberResponse[] = (members || []).map(member => ({
        ...member,
        profile: profileMap.get(member.user_id) || null
      }));

      console.log(`[teams-api] Found ${rosterWithProfiles.length} roster members`);
      return new Response(
        JSON.stringify({ roster: rosterWithProfiles, user_role: membership.role }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /profile - Get current user's profile
    if (path === '/profile' && req.method === 'GET') {
      console.log('[teams-api] Fetching user profile');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('[teams-api] Error fetching profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[teams-api] Profile found:', profile ? 'yes' : 'no');
      return new Response(
        JSON.stringify({ profile: profile || null, user_id: userId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /player/:userId - Get specific player info (for coaches)
    const playerMatch = path.match(/^\/player\/([a-f0-9-]+)$/);
    if (playerMatch && req.method === 'GET') {
      const playerId = playerMatch[1];
      console.log(`[teams-api] Fetching player: ${playerId}`);

      // Get requesting user's coach memberships
      const { data: coachMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .eq('role', 'coach')
        .eq('status', 'active');

      const coachTeamIds = coachMemberships?.map(m => m.team_id) || [];

      // Check if the player is on any of the coach's teams
      const { data: playerMembership } = await supabase
        .from('team_members')
        .select('*, teams(*)')
        .eq('user_id', playerId)
        .in('team_id', coachTeamIds)
        .eq('status', 'active');

      if (!playerMembership || playerMembership.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Forbidden', message: 'You do not have access to this player' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get player profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', playerId)
        .maybeSingle();

      console.log(`[teams-api] Player found on ${playerMembership.length} shared teams`);
      return new Response(
        JSON.stringify({
          player: {
            user_id: playerId,
            profile,
            team_memberships: playerMembership
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /training - Log a training session
    if (path === '/training' && req.method === 'POST') {
      console.log('[teams-api] Creating training log');
      
      const body = await req.json();
      const { team_id, workout_id, title, description, duration_minutes, intensity, notes, logged_at } = body;

      if (!title) {
        return new Response(
          JSON.stringify({ error: 'Title is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If team_id provided, verify user is a member
      if (team_id) {
        const { data: membership } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', team_id)
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (!membership) {
          return new Response(
            JSON.stringify({ error: 'Forbidden', message: 'You are not a member of this team' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const { data: log, error: logError } = await supabase
        .from('training_logs')
        .insert({
          user_id: userId,
          team_id: team_id || null,
          workout_id: workout_id || null,
          title,
          description: description || null,
          duration_minutes: duration_minutes || null,
          intensity: intensity || null,
          notes: notes || null,
          logged_at: logged_at || new Date().toISOString()
        })
        .select()
        .single();

      if (logError) {
        console.error('[teams-api] Error creating training log:', logError);
        return new Response(
          JSON.stringify({ error: 'Failed to create training log', details: logError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[teams-api] Training log created:', log.id);
      return new Response(
        JSON.stringify({ training_log: log }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /training - Get user's training logs
    if (path === '/training' && req.method === 'GET') {
      console.log('[teams-api] Fetching training logs for user');
      
      const teamId = url.searchParams.get('team_id');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('training_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data: logs, error: logsError } = await query;

      if (logsError) {
        console.error('[teams-api] Error fetching training logs:', logsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch training logs' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[teams-api] Found ${logs?.length || 0} training logs`);
      return new Response(
        JSON.stringify({ training_logs: logs || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /training/team/:teamId - Get training logs for all team members (coaches only)
    const teamTrainingMatch = path.match(/^\/training\/team\/([a-f0-9-]+)$/);
    if (teamTrainingMatch && req.method === 'GET') {
      const teamId = teamTrainingMatch[1];
      console.log(`[teams-api] Fetching team training logs for: ${teamId}`);

      // Verify user is a coach of this team
      const { data: membership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (!membership || membership.role !== 'coach') {
        return new Response(
          JSON.stringify({ error: 'Forbidden', message: 'Only coaches can view team training logs' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const playerId = url.searchParams.get('player_id');

      let query = supabase
        .from('training_logs')
        .select('*')
        .eq('team_id', teamId)
        .order('logged_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (playerId) {
        query = query.eq('user_id', playerId);
      }

      const { data: logs, error: logsError } = await query;

      if (logsError) {
        console.error('[teams-api] Error fetching team training logs:', logsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch team training logs' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user profiles for the logs
      const userIds = [...new Set(logs?.map(l => l.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const logsWithProfiles = (logs || []).map(log => ({
        ...log,
        profile: profileMap.get(log.user_id) || null
      }));

      console.log(`[teams-api] Found ${logs?.length || 0} team training logs`);
      return new Response(
        JSON.stringify({ training_logs: logsWithProfiles }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /training/stats - Get training statistics for user
    if (path === '/training/stats' && req.method === 'GET') {
      console.log('[teams-api] Fetching training stats for user');
      
      const teamId = url.searchParams.get('team_id');
      const days = parseInt(url.searchParams.get('days') || '30');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('training_logs')
        .select('id, duration_minutes, intensity, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', startDate.toISOString());

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data: logs, error: logsError } = await query;

      if (logsError) {
        console.error('[teams-api] Error fetching training stats:', logsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch training stats' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const totalSessions = logs?.length || 0;
      const totalMinutes = logs?.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) || 0;
      const intensityCounts = {
        low: logs?.filter(l => l.intensity === 'low').length || 0,
        medium: logs?.filter(l => l.intensity === 'medium').length || 0,
        high: logs?.filter(l => l.intensity === 'high').length || 0
      };

      console.log('[teams-api] Training stats calculated');
      return new Response(
        JSON.stringify({
          stats: {
            period_days: days,
            total_sessions: totalSessions,
            total_minutes: totalMinutes,
            average_duration: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
            intensity_breakdown: intensityCounts
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /training/:logId - Delete a training log
    const deleteTrainingMatch = path.match(/^\/training\/([a-f0-9-]+)$/);
    if (deleteTrainingMatch && req.method === 'DELETE') {
      const logId = deleteTrainingMatch[1];
      console.log(`[teams-api] Deleting training log: ${logId}`);

      const { error: deleteError } = await supabase
        .from('training_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('[teams-api] Error deleting training log:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete training log' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[teams-api] Training log deleted');
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 404 for unknown routes
    console.log(`[teams-api] Unknown route: ${path}`);
    return new Response(
      JSON.stringify({ 
        error: 'Not found', 
        message: 'Unknown endpoint',
        available_endpoints: [
          'GET /teams - List your teams',
          'GET /teams/:teamId - Get team details',
          'GET /teams/:teamId/roster - Get team roster',
          'GET /profile - Get your profile',
          'GET /player/:userId - Get player info (coaches only)',
          'POST /training - Log a training session',
          'GET /training - Get your training logs',
          'GET /training/stats - Get your training statistics',
          'GET /training/team/:teamId - Get team training logs (coaches only)',
          'DELETE /training/:logId - Delete a training log'
        ]
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[teams-api] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
