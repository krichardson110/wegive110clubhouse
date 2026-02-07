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

    // Parse request body
    const { invitation_id, team_name, inviter_name }: InviteRequest = await req.json();

    if (!invitation_id || !team_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: invitation_id and team_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the invitation details
    const { data: invitation, error: inviteError } = await supabase
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

    // Verify the user is authorized to send this invite (they should be the one who created it)
    if (invitation.invited_by !== userId) {
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

    // Build the invite URL
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://wegive110clubhouse.lovable.app';
    const inviteUrl = `https://wegive110clubhouse.lovable.app/teams/join?token=${invitation.token}`;

    // Determine the role description
    const roleDescriptions: Record<string, string> = {
      'player': 'a player',
      'parent': 'a parent/guardian',
      'coach': 'an assistant coach'
    };
    const roleDesc = roleDescriptions[invitation.invite_type] || 'a member';

    // Build email content
    const playerNameSection = invitation.player_name 
      ? `<p style="color: #374151; font-size: 16px;">Player: <strong>${invitation.player_name}</strong></p>` 
      : '';

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
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        This invitation will expire in 7 days. If you don't have an account yet, you'll be able to create one when you accept the invitation.
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
      from: 'We Give 110% Clubhouse <noreply@resend.dev>',
      to: [invitation.email],
      subject: `You're invited to join ${team_name}!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('[send-team-invite] Failed to send email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[send-team-invite] Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-team-invite] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
