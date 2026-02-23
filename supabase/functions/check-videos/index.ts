import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get all videos
  const { data: videos } = await supabase.from("videos").select("id, title, youtube_id").eq("published", true);
  const { data: wellnessVideos } = await supabase.from("wellness_videos").select("id, title, youtube_id").eq("published", true);

  const allVideos = [
    ...(videos || []).map(v => ({ ...v, source: "videos" })),
    ...(wellnessVideos || []).map(v => ({ ...v, source: "wellness_videos" })),
  ];

  const results: any[] = [];

  for (const video of allVideos) {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.youtube_id}&format=json`);
      if (!res.ok) {
        results.push({ id: video.id, title: video.title, youtube_id: video.youtube_id, source: video.source, status: res.status, working: false });
      }
    } catch (e) {
      results.push({ id: video.id, title: video.title, youtube_id: video.youtube_id, source: video.source, status: "error", working: false });
    }
  }

  return new Response(JSON.stringify({ total: allVideos.length, broken: results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
