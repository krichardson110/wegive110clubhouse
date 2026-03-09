import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function checkYouTubeId(youtubeId: string): Promise<{ id: string; exists: boolean; hasThumbnail: boolean }> {
  try {
    // Use oEmbed API to check if video exists
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`);
    const exists = response.ok;
    
    // Check thumbnail
    let hasThumbnail = false;
    if (exists) {
      const thumbResponse = await fetch(`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`, { method: 'HEAD' });
      // YouTube returns a default "no thumbnail" image (120x90) for missing thumbnails
      // mqdefault is 320x180 for real videos
      hasThumbnail = thumbResponse.ok;
    }
    
    return { id: youtubeId, exists, hasThumbnail };
  } catch {
    return { id: youtubeId, exists: false, hasThumbnail: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch all youtube IDs from all three tables
    const [videosRes, workoutsRes, wellnessRes] = await Promise.all([
      supabase.from("videos").select("id, title, youtube_id").eq("published", true),
      supabase.from("workouts").select("id, title, youtube_id").eq("published", true).not("youtube_id", "is", null),
      supabase.from("wellness_videos").select("id, title, youtube_id").eq("published", true),
    ]);

    const allEntries = [
      ...(videosRes.data || []).map(v => ({ ...v, table: "videos" })),
      ...(workoutsRes.data || []).map(v => ({ ...v, table: "workouts" })),
      ...(wellnessRes.data || []).map(v => ({ ...v, table: "wellness_videos" })),
    ];

    // Deduplicate by youtube_id for checking
    const uniqueIds = [...new Set(allEntries.map(e => e.youtube_id).filter(Boolean))];
    
    // Check in batches of 10
    const results: Record<string, { exists: boolean; hasThumbnail: boolean }> = {};
    for (let i = 0; i < uniqueIds.length; i += 10) {
      const batch = uniqueIds.slice(i, i + 10);
      const batchResults = await Promise.all(batch.map(id => checkYouTubeId(id)));
      for (const r of batchResults) {
        results[r.id] = { exists: r.exists, hasThumbnail: r.hasThumbnail };
      }
    }

    // Find broken entries
    const broken = allEntries.filter(e => {
      const check = results[e.youtube_id];
      return !check || !check.exists || !check.hasThumbnail;
    });

    const working = allEntries.filter(e => {
      const check = results[e.youtube_id];
      return check && check.exists && check.hasThumbnail;
    });

    return new Response(JSON.stringify({
      total_checked: uniqueIds.length,
      total_entries: allEntries.length,
      broken_count: broken.length,
      working_count: working.length,
      broken,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
