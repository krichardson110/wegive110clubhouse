import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "./PostCard";
import type { Post, Profile } from "@/types/community";
import { Loader2 } from "lucide-react";

// Example posts shown when database is empty
const examplePosts: Post[] = [
  {
    id: "example-1",
    user_id: "example-coach",
    content: "💪 Great practice today team! The energy was unmatched. Keep pushing - championship mindset starts with championship effort every single day.",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 12,
    comments_count: 3,
    media_urls: [],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach K",
      bio: "Head Coach | Building champions on and off the court",
      avatar_url: null,
      posts_count: 4,
      likes_given_count: 8,
      comments_count: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-2",
    user_id: "example-coach",
    content: "🏀 Reminder: Check out Chapter 3 in the Playbook on defensive rotations. We'll be drilling these concepts all week. Come prepared!",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 8,
    comments_count: 2,
    media_urls: [],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach K",
      bio: "Head Coach | Building champions on and off the court",
      avatar_url: null,
      posts_count: 4,
      likes_given_count: 8,
      comments_count: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-3",
    user_id: "example-player",
    content: "🔥 \"Hard work beats talent when talent doesn't work hard.\" - Tim Notke\n\nLet this sink in. Ready for tomorrow's 6 AM practice!",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 15,
    comments_count: 4,
    media_urls: [],
    profile: {
      id: "example-profile-2",
      user_id: "example-player",
      display_name: "Marcus J.",
      bio: "Point Guard #23 | Junior | Dream big, work harder",
      avatar_url: null,
      posts_count: 7,
      likes_given_count: 22,
      comments_count: 11,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-4",
    user_id: "example-coach",
    content: "📢 Big shoutout to the team for the community service event last weekend! Proud of how you all represent our program. That's what being a true athlete is about. 🙌",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 24,
    comments_count: 6,
    media_urls: [],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach K",
      bio: "Head Coach | Building champions on and off the court",
      avatar_url: null,
      posts_count: 4,
      likes_given_count: 8,
      comments_count: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
];

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
      
      // If no posts in database, return example posts
      if (postsData.length === 0) {
        return examplePosts;
      }
      
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

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsFeed;
