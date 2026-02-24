import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function isValidUUID(value: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[create-team-member] Processing request');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const body = await req.json();
    const { team_id, email, role, player_name } = body;

    // Validate inputs
    if (!team_id || !isValidUUID(team_id)) {
      return new Response(
        JSON.stringify({ error: 'Valid team_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validRoles = ['player', 'coach', 'parent'];
    if (!role || !validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Role must be player, coach, or parent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((role === 'player' || role === 'parent') && (!player_name || typeof player_name !== 'string' || player_name.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Player name is required for players and parents' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify coach is authorized
    const { data: isCoach } = await supabase.rpc('is_team_coach', { team_uuid: team_id });
    if (!isCoach) {
      return new Response(
        JSON.stringify({ error: 'Only coaches can add team members' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    let tempPassword: string | null = null;
    let accountCreated = false;
    let memberUserId: string;

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === normalizedEmail);

    if (existingUser) {
      console.log(`[create-team-member] User already exists: ${normalizedEmail}`);
      memberUserId = existingUser.id;

      // Check if already a member of this team
      const { data: existingMember } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('team_id', team_id)
        .eq('user_id', memberUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: 'This person is already a member of the team' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new account
      tempPassword = generateTempPassword();
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error('[create-team-member] Failed to create user:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      memberUserId = newUser.user.id;
      accountCreated = true;

      // Create profile
      const displayName = player_name || normalizedEmail.split('@')[0];
      await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: memberUserId,
          display_name: displayName,
          force_password_change: true,
          temp_password_set_at: new Date().toISOString(),
        });

      console.log(`[create-team-member] Created user: ${memberUserId}`);
    }

    // Add to team
    const { data: newMember, error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id,
        user_id: memberUserId,
        role,
        player_name: player_name || null,
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) {
      console.error('[create-team-member] Failed to add team member:', memberError);
      return new Response(
        JSON.stringify({ error: 'Failed to add member to team' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add to team_member_players if applicable
    if (player_name && (role === 'player' || role === 'parent')) {
      await supabaseAdmin
        .from('team_member_players')
        .insert({
          team_member_id: newMember.id,
          player_name,
        });
    }

    console.log(`[create-team-member] Successfully added ${normalizedEmail} as ${role}`);

    return new Response(
      JSON.stringify({
        success: true,
        email: normalizedEmail,
        role,
        player_name: player_name || null,
        account_created: accountCreated,
        temporary_password: tempPassword,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[create-team-member] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
