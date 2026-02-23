import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, teamId, userId } = await req.json();

    if (action === "generate-report") {
      // Generate a Drive 5 progress report for a specific player
      if (!userId) throw new Error("userId is required");

      // Get player profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", userId)
        .single();

      // Get categories
      const { data: categories } = await supabase
        .from("drive5_categories")
        .select("*")
        .order("display_order");

      // Get goals
      const { data: goals } = await supabase
        .from("player_goals")
        .select("*, drive5_categories(*)")
        .eq("user_id", userId)
        .eq("status", "active");

      // Get last 7 days of checkins
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { data: weeklyCheckins } = await supabase
        .from("daily_checkins")
        .select("*, drive5_categories(*)")
        .eq("user_id", userId)
        .gte("checkin_date", weekAgo)
        .eq("completed", true);

      // Get all checkins for streak calc
      const { data: allCheckins } = await supabase
        .from("daily_checkins")
        .select("checkin_date")
        .eq("user_id", userId)
        .eq("completed", true)
        .order("checkin_date", { ascending: false });

      // Calculate streak
      let currentStreak = 0;
      if (allCheckins?.length) {
        const uniqueDates = [...new Set(allCheckins.map(c => c.checkin_date))].sort().reverse();
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          for (let i = 0; i < uniqueDates.length; i++) {
            const expected = new Date(Date.now() - (i * 86400000) - (uniqueDates[0] === yesterday ? 86400000 : 0));
            if (uniqueDates[i] === expected.toISOString().split("T")[0]) currentStreak++;
            else break;
          }
        }
      }

      // Build category breakdown
      const categoryBreakdown = (categories || []).map(cat => ({
        name: cat.name,
        icon: cat.icon,
        weeklyCount: (weeklyCheckins || []).filter(c => c.category_id === cat.id).length,
        goal: (goals || []).find((g: any) => g.category_id === cat.id),
      }));

      const totalWeekly = (weeklyCheckins || []).length;
      const maxPossible = (categories || []).length * 7;

      return new Response(JSON.stringify({
        playerName: profile?.display_name || "Player",
        currentStreak,
        totalWeeklyCheckins: totalWeekly,
        maxPossible,
        completionRate: maxPossible > 0 ? Math.round((totalWeekly / maxPossible) * 100) : 0,
        categoryBreakdown,
        goals: (goals || []).map((g: any) => ({
          title: g.title,
          category: g.drive5_categories?.name,
          icon: g.drive5_categories?.icon,
          progress: g.target_value > 0 ? Math.round(((g.current_value || 0) / g.target_value) * 100) : 0,
          currentValue: g.current_value || 0,
          targetValue: g.target_value || 90,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send-email-report") {
      if (!resendApiKey) {
        return new Response(JSON.stringify({ error: "Email not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { recipientEmail, reportData, playerName } = await req.json();
      if (!recipientEmail || !reportData) throw new Error("recipientEmail and reportData required");

      // Build HTML email
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 20px; border-radius: 12px;">
          <h1 style="color: #f97316; margin: 0;">🔥 Drive 5 Weekly Report</h1>
          <p style="color: #999;">Player: <strong style="color: #fff;">${playerName || "Player"}</strong></p>
          
          <div style="display: flex; gap: 12px; margin: 20px 0;">
            <div style="flex: 1; background: #2a2a3e; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #f97316;">${reportData.currentStreak}</div>
              <div style="font-size: 12px; color: #999;">Day Streak</div>
            </div>
            <div style="flex: 1; background: #2a2a3e; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${reportData.completionRate}%</div>
              <div style="font-size: 12px; color: #999;">Weekly Rate</div>
            </div>
            <div style="flex: 1; background: #2a2a3e; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #eab308;">${reportData.totalWeeklyCheckins}/${reportData.maxPossible}</div>
              <div style="font-size: 12px; color: #999;">Check-ins</div>
            </div>
          </div>

          <h3 style="color: #f97316; margin-top: 24px;">Category Breakdown</h3>
          ${(reportData.categoryBreakdown || []).map((cat: any) => `
            <div style="margin: 8px 0; padding: 8px 12px; background: #2a2a3e; border-radius: 6px;">
              <span>${cat.icon} ${cat.name}: <strong>${cat.weeklyCount}/7</strong></span>
            </div>
          `).join("")}

          ${reportData.goals?.length ? `
            <h3 style="color: #f97316; margin-top: 24px;">90-Day Goals</h3>
            ${reportData.goals.map((g: any) => `
              <div style="margin: 8px 0; padding: 8px 12px; background: #2a2a3e; border-radius: 6px;">
                <span>${g.icon || "🎯"} ${g.title}: <strong>${g.progress}%</strong> (${g.currentValue}/${g.targetValue})</span>
              </div>
            `).join("")}
          ` : ""}

          <p style="margin-top: 24px; font-size: 12px; color: #666; text-align: center;">
            Powered by We Give 110 Clubhouse
          </p>
        </div>
      `;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Drive 5 Reports <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: `🔥 ${playerName || "Player"}'s Drive 5 Weekly Report`,
          html,
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.text();
        throw new Error(`Failed to send email: ${err}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
