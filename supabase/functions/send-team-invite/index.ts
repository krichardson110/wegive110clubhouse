import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface InviteRequest {
  invitation_id: string;
  team_name: string;
  inviter_name: string;
  create_account?: boolean;
}

// Generate a secure temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[send-team-invite] Processing invite email request');

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[send-team-invite] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Create admin client for creating users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify the JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claims?.claims) {
      console.log('[send-team-invite] Invalid token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub;
    console.log(`[send-team-invite] Authenticated user: ${userId}`);

    const body = await req.json();
    const { invitation_id, team_name, inviter_name, create_account }: InviteRequest = body;

    if (!invitation_id || typeof invitation_id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(invitation_id)) {
      return new Response(
        JSON.stringify({ error: 'Valid invitation_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!team_name || typeof team_name !== 'string' || team_name.trim().length === 0 || team_name.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Valid team_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the invitation details using admin client to bypass RLS
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('id', invitation_id)
      .single();

    if (inviteError || !invitation) {
      console.error('[send-team-invite] Invitation not found:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Invitation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-team-invite] Found invitation for: ${invitation.email}`);

    // Verify the user is authorized to send this invite (they should be the one who created it or a team coach)
    const { data: isCoach } = await supabaseAdmin.rpc('is_team_coach', { team_uuid: invitation.team_id });
    
    if (invitation.invited_by !== userId && !isCoach) {
      console.log('[send-team-invite] User not authorized to send this invite');
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('[send-team-invite] RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey.trim());

    // Build the invite URL (use the request origin so preview links go to preview, published links go to published)
    const baseUrl = (req.headers.get('origin') || 'https://wegive110clubhouse.lovable.app').replace(/\/$/, '');
    const inviteUrl = `${baseUrl}/teams/join?token=${invitation.token}`;

    // Determine the role description
    const roleDescriptions: Record<string, string> = {
      'player': 'a player',
      'parent': 'a parent/guardian',
      'coach': 'an assistant coach'
    };
    const roleDesc = roleDescriptions[invitation.invite_type] || 'a member';

    let tempPassword: string | null = null;
    let accountCreated = false;

    // If create_account is true, create a Supabase auth account
    if (create_account) {
      console.log(`[send-team-invite] Creating Drive 5 account for: ${invitation.email}`);
      
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === invitation.email);
      
      if (existingUser) {
        console.log(`[send-team-invite] User already exists: ${invitation.email}`);
        // User already exists, don't create new account but still send invite
        // Set a flag so we can tell the caller
      } else {
        // Generate temporary password
        tempPassword = generateTempPassword();
        
        // Create the auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: invitation.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email since coach is inviting
        });

        if (createError) {
          console.error('[send-team-invite] Failed to create user:', createError);
          // Continue with invite even if account creation failed
        } else {
          console.log(`[send-team-invite] Created user: ${newUser.user?.id}`);
          accountCreated = true;

          // Create profile with force_password_change flag
          const displayName = invitation.player_name || invitation.email.split('@')[0];
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              user_id: newUser.user!.id,
              display_name: displayName,
              force_password_change: true,
              temp_password_set_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error('[send-team-invite] Failed to create profile:', profileError);
          }
        }
      }
    }

    // Build email content
    const playerNameSection = invitation.player_name 
      ? `<p style="color: #374151; font-size: 16px;">Player: <strong>${invitation.player_name}</strong></p>` 
      : '';

    // Credentials section for newly created accounts
    const credentialsSection = accountCreated && tempPassword ? `
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h3 style="color: white; margin: 0 0 12px 0; font-size: 16px;">🎉 Your Drive 5 Account Has Been Created!</h3>
        <p style="color: white; margin: 0 0 8px 0; font-size: 14px;">
          You can now log in to both Drive 5 and the Clubhouse using these credentials:
        </p>
        <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 6px; margin-top: 12px;">
          <p style="color: white; margin: 0; font-size: 14px;">
            <strong>Email:</strong> ${invitation.email}<br>
            <strong>Temporary Password:</strong> ${tempPassword}
          </p>
        </div>
        <p style="color: rgba(255,255,255,0.8); margin: 12px 0 0 0; font-size: 12px;">
          ⚠️ You'll be asked to change your password on first login.
        </p>
      </div>
    ` : '';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🏆 We Give 110% Clubhouse</h1>
    </div>
    
    <div style="padding: 32px;">
      <h2 style="color: #1f2937; font-size: 22px; margin-bottom: 16px;">You're Invited to Join a Team!</h2>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        <strong>${inviter_name || 'A coach'}</strong> has invited you to join <strong>${team_name}</strong> as ${roleDesc}.
      </p>
      
      ${playerNameSection}
      
      ${credentialsSection}
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        ${accountCreated 
          ? 'Click the button above to accept the invitation and access your new account. You can also log in at <a href="https://wegive110.com" style="color: #7c3aed;">wegive110.com</a> (Drive 5) with the same credentials.'
          : "This invitation will expire in 7 days. If you don't have an account yet, you'll be able to create one when you accept the invitation."
        }
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      
      <p style="color: #9ca3af; font-size: 12px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
      
      <p style="color: #9ca3af; font-size: 12px;">
        Or copy this link: <br>
        <a href="${inviteUrl}" style="color: #7c3aed; word-break: break-all;">${inviteUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

    // Send the email
    console.log(`[send-team-invite] Sending invite email to: ${invitation.email}`);
    
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'We Give 110% Clubhouse <noreply@wegive110.com>',
      to: [invitation.email],
      subject: accountCreated 
        ? `Your Drive 5 Account is Ready - Join ${team_name}!`
        : `You're invited to join ${team_name}!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('[send-team-invite] Failed to send email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[send-team-invite] Email sent successfully:', emailResult);

    // Check if we tried to create an account but user already existed
    const userAlreadyExisted = create_account && !accountCreated;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: accountCreated 
          ? 'Invitation email sent with Drive 5 account credentials' 
          : userAlreadyExisted
            ? 'Invitation sent - user already has a Drive 5 account'
            : 'Invitation email sent',
        accountCreated,
        userAlreadyExisted,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-team-invite] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});