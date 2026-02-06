import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { PostComment, Profile } from "@/types/community";

interface CommentsSectionProps {
  postId: string;
}

const SUPER_ADMIN_EMAIL = "krichardson@wegive110.com";

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
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
      
      return commentsData.map((comment) => ({
        ...comment,
        profile: profileMap.get(comment.user_id) as Profile | undefined,
      })) as PostComment[];
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

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast({ title: "Error deleting comment", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment.mutate();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading comments...</div>
      ) : (
        <>
          {comments.map((comment) => {
            const displayName = comment.profile?.display_name || "Team Member";
            const initials = displayName.slice(0, 2).toUpperCase();
            const canDelete = user?.id === comment.user_id || user?.email === SUPER_ADMIN_EMAIL;
            
            return (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-secondary/50 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{displayName}</span>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteComment.mutate(comment.id)}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}
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
