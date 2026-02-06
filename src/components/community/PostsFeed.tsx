import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "./PostCard";
import type { Post, Profile } from "@/types/community";
import { Loader2 } from "lucide-react";

const PostsFeed = () => {
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles for all posts
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);
      
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      
      // If user is logged in, check which posts they've liked
      let likedPostIds: Set<string> = new Set();
      if (user?.id) {
        const { data: likes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);
        likedPostIds = new Set((likes || []).map((l) => l.post_id));
      }
      
      return postsData.map((post) => ({
        ...post,
        media_urls: (post.media_urls as string[]) || [],
        profile: profileMap.get(post.user_id) as Profile | undefined,
        user_has_liked: likedPostIds.has(post.id),
      })) as Post[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsFeed;
