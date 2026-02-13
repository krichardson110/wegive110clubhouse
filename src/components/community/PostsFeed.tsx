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
    content: "🎥 Great drill for working on bat speed and staying inside the ball. Focus on keeping your hands tight and driving through the zone. Try this one at home!\n\nVideo: Youth Hitting Drill - Stay Inside",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 18,
    comments_count: 5,
    media_urls: ["https://img.youtube.com/vi/oBk4EUB3kdk/maxresdefault.jpg"],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach Richardson",
      bio: "Head Coach | 15+ years developing young athletes",
      avatar_url: null,
      posts_count: 12,
      likes_given_count: 45,
      comments_count: 28,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-2",
    user_id: "example-parent",
    content: "📸 What an incredible game yesterday! So proud of these boys - they left everything on the field. That double play in the 5th inning was picture perfect! 🔥⚾",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 32,
    comments_count: 8,
    media_urls: [
      "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    ],
    profile: {
      id: "example-profile-3",
      user_id: "example-parent",
      display_name: "Sarah M.",
      bio: "Team Mom | Proud parent of #14",
      avatar_url: null,
      posts_count: 8,
      likes_given_count: 56,
      comments_count: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-3",
    user_id: "example-coach",
    content: "💪 Great practice today team! The energy was unmatched. Keep pushing - championship mindset starts with championship effort every single day.\n\nRemember: We don't rise to the level of our expectations, we fall to the level of our training.",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 24,
    comments_count: 6,
    media_urls: ["https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&q=80"],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach Richardson",
      bio: "Head Coach | 15+ years developing young athletes",
      avatar_url: null,
      posts_count: 12,
      likes_given_count: 45,
      comments_count: 28,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-4",
    user_id: "example-player",
    content: "🔥 Been working on this curveball grip Coach showed us. Starting to really feel the spin. Can't wait to try it in a game situation! 🎯\n\n#GrindDontStop #BaseballLife",
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 15,
    comments_count: 4,
    media_urls: ["https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80"],
    profile: {
      id: "example-profile-2",
      user_id: "example-player",
      display_name: "Marcus J.",
      bio: "Pitcher #23 | Junior | Dream big, work harder",
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
    id: "example-5",
    user_id: "example-coach",
    content: "🎬 For those asking about outfield footwork - here's a great breakdown video. Watch how the feet set up BEFORE the throw. This is what separates good outfielders from great ones.\n\nStudy this and come ready to drill it Thursday!",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 21,
    comments_count: 7,
    media_urls: ["https://img.youtube.com/vi/U9Gr4OnGJQA/maxresdefault.jpg"],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach Richardson",
      bio: "Head Coach | 15+ years developing young athletes",
      avatar_url: null,
      posts_count: 12,
      likes_given_count: 45,
      comments_count: 28,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-6",
    user_id: "example-parent",
    content: "🏆 Tournament weekend photos are here! What an amazing run - so proud of the whole team. These memories will last a lifetime. Thanks to all the coaches and parents who made this happen! 🙌",
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 45,
    comments_count: 12,
    media_urls: [
      "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80",
      "https://images.unsplash.com/photo-1578432014316-48b448d79d57?w=800&q=80",
      "https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93?w=800&q=80",
    ],
    profile: {
      id: "example-profile-4",
      user_id: "example-parent",
      display_name: "Mike T.",
      bio: "Team photographer | Dad of #8 | Baseball is life",
      avatar_url: null,
      posts_count: 15,
      likes_given_count: 67,
      comments_count: 23,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-7",
    user_id: "example-coach",
    content: "📢 Reminder: Check out Chapter 3 in the Playbook on defensive rotations. We'll be drilling these concepts all week. Come prepared!\n\nAlso - parents, don't forget to sign up for the snack schedule for next week's games.",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 8,
    comments_count: 2,
    media_urls: [],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach Richardson",
      bio: "Head Coach | 15+ years developing young athletes",
      avatar_url: null,
      posts_count: 12,
      likes_given_count: 45,
      comments_count: 28,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-8",
    user_id: "example-player",
    content: "🔥 \"Hard work beats talent when talent doesn't work hard.\" - Tim Notke\n\nLet this sink in. Ready for tomorrow's 6 AM practice! Who else is getting after it early? 💪",
    created_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 28,
    comments_count: 9,
    media_urls: [],
    profile: {
      id: "example-profile-2",
      user_id: "example-player",
      display_name: "Marcus J.",
      bio: "Pitcher #23 | Junior | Dream big, work harder",
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
    id: "example-9",
    user_id: "example-parent",
    content: "⚾ Caught this awesome moment at batting practice! The focus in his eyes 👀 - you can see the improvement week over week. Thank you coaches for all you do!",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 19,
    comments_count: 5,
    media_urls: ["https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=80"],
    profile: {
      id: "example-profile-3",
      user_id: "example-parent",
      display_name: "Sarah M.",
      bio: "Team Mom | Proud parent of #14",
      avatar_url: null,
      posts_count: 8,
      likes_given_count: 56,
      comments_count: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    user_has_liked: false,
  },
  {
    id: "example-10",
    user_id: "example-coach",
    content: "📢 Big shoutout to the team for the community service event last weekend! Proud of how you all represent our program. That's what being a true athlete is about. 🙌\n\nCharacter first, always.",
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    published: true,
    likes_count: 38,
    comments_count: 11,
    media_urls: ["https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80"],
    profile: {
      id: "example-profile-1",
      user_id: "example-coach",
      display_name: "Coach Richardson",
      bio: "Head Coach | 15+ years developing young athletes",
      avatar_url: null,
      posts_count: 12,
      likes_given_count: 45,
      comments_count: 28,
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
        .from("profiles_public")
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
