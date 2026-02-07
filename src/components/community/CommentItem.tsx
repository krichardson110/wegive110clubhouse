import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2, Pencil, Send, X, Check, CornerDownRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import MentionInput from "./MentionInput";
import MentionText from "./MentionText";
import type { PostComment } from "@/types/community";

interface CommentItemProps {
  comment: PostComment;
  postId: string;
  isReply?: boolean;
  onReply?: (parentId: string) => void;
  activeReplyId: string | null;
  setActiveReplyId: (id: string | null) => void;
}

const SUPER_ADMIN_EMAIL = "krichardson@wegive110.com";

const CommentItem = ({ 
  comment, 
  postId, 
  isReply = false,
  onReply,
  activeReplyId,
  setActiveReplyId,
}: CommentItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");

  const displayName = comment.profile?.display_name || "Team Member";
  const initials = displayName.slice(0, 2).toUpperCase();
  const canDelete = user?.id === comment.user_id || user?.email === SUPER_ADMIN_EMAIL;
  const canEdit = user?.id === comment.user_id;
  const isShowingReplyForm = activeReplyId === comment.id;

  // Like comment mutation
  const likeComment = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      if (comment.user_has_liked) {
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", comment.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_likes")
          .insert({ comment_id: comment.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Edit comment mutation
  const editComment = useMutation({
    mutationFn: async () => {
      if (!user?.id || !editContent.trim()) throw new Error("Invalid");
      
      const { error } = await supabase
        .from("post_comments")
        .update({ content: editContent.trim() })
        .eq("id", comment.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setIsEditing(false);
      toast({ title: "Comment updated" });
    },
    onError: (error) => {
      toast({ title: "Error updating comment", description: error.message, variant: "destructive" });
    },
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", comment.id);
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

  // Reply to comment mutation
  const addReply = useMutation({
    mutationFn: async () => {
      if (!user?.id || !replyContent.trim()) throw new Error("Invalid");
      
      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: replyContent.trim(),
          parent_comment_id: comment.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setReplyContent("");
      setActiveReplyId(null);
    },
    onError: (error) => {
      toast({ title: "Error adding reply", description: error.message, variant: "destructive" });
    },
  });

  const handleEditSubmit = () => {
    if (editContent.trim()) {
      editComment.mutate();
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      addReply.mutate();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  return (
    <div className={cn("space-y-2", isReply && "ml-8")}>
      <div className="flex gap-2">
        {isReply && (
          <CornerDownRight className="w-4 h-4 text-muted-foreground mt-2 flex-shrink-0" />
        )}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-secondary/50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {canEdit && !isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteComment.mutate()}
                    disabled={deleteComment.isPending}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditSubmit}
                    disabled={!editContent.trim() || editComment.isPending}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <MentionText text={comment.content} className="text-sm text-foreground" />
            )}
          </div>
          
          {/* Comment actions */}
          <div className="flex items-center gap-3 mt-1 ml-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            
            {user && (
              <>
                <button
                  onClick={() => likeComment.mutate()}
                  disabled={likeComment.isPending}
                  className={cn(
                    "flex items-center gap-1 text-xs transition-colors",
                    comment.user_has_liked 
                      ? "text-red-500" 
                      : "text-muted-foreground hover:text-red-500"
                  )}
                >
                  <Heart className={cn("w-3 h-3", comment.user_has_liked && "fill-current")} />
                  {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                </button>
                
                {!isReply && (
                  <button
                    onClick={() => setActiveReplyId(isShowingReplyForm ? null : comment.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Reply
                  </button>
                )}
              </>
            )}
          </div>

          {/* Reply form */}
          {isShowingReplyForm && user && (
            <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2">
              <MentionInput
                value={replyContent}
                onChange={setReplyContent}
                onSubmit={() => replyContent.trim() && addReply.mutate()}
                placeholder={`Reply to ${displayName}... Use @ to mention`}
                className="h-8 text-sm"
                autoFocus
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setActiveReplyId(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8"
                disabled={!replyContent.trim() || addReply.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              isReply={true}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
