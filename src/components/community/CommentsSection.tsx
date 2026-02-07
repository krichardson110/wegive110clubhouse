import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CommentItem from "./CommentItem";
import type { PostComment, Profile } from "@/types/community";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      // Fetch all comments for this post
      const { data: commentsData, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Fetch profiles for all comments
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);
      
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      
      // Fetch user's likes on comments if logged in
      let userLikes: Set<string> = new Set();
      if (user?.id) {
        const { data: likesData } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", commentsData.map((c) => c.id));
        
        userLikes = new Set((likesData || []).map((l) => l.comment_id));
      }
      
      // Map comments with profiles and like status
      const enrichedComments = commentsData.map((comment) => ({
        ...comment,
        profile: profileMap.get(comment.user_id) as Profile | undefined,
        user_has_liked: userLikes.has(comment.id),
        replies: [] as PostComment[],
      })) as PostComment[];
      
      // Organize into parent/reply structure
      const commentMap = new Map(enrichedComments.map((c) => [c.id, c]));
      const topLevelComments: PostComment[] = [];
      
      enrichedComments.forEach((comment) => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(comment);
          }
        } else {
          topLevelComments.push(comment);
        }
      });
      
      return topLevelComments;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user?.id || !newComment.trim()) throw new Error("Invalid");
      
      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setNewComment("");
    },
    onError: (error) => {
      toast({ title: "Error adding comment", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment.mutate();
    }
  };

  // Count total comments including replies
  const totalComments = comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading comments...</div>
      ) : (
        <>
          {comments.length > 0 && (
            <div className="text-xs text-muted-foreground mb-2">
              {totalComments} {totalComments === 1 ? "comment" : "comments"}
            </div>
          )}
          
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
            />
          ))}
        </>
      )}

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-secondary/30"
          />
          <Button type="submit" size="icon" disabled={!newComment.trim() || addComment.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
};

export default CommentsSection;
