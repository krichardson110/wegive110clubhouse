import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, MoreHorizontal, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@/types/community";
import CommentsSection from "./CommentsSection";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; isVideo: boolean } | null>(null);

  const isOwner = user?.id === post.user_id;
  const canDelete = isOwner || isSuperAdmin;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      if (post.user_has_liked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Post deleted" });
    },
    onError: (error) => {
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    },
  });

  const displayName = post.profile?.display_name || "Team Member";
  const initials = displayName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-foreground">{displayName}</h4>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <p className="text-foreground whitespace-pre-wrap mb-3">{post.content}</p>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className={`grid gap-2 mb-3 ${
            post.media_urls.length === 1 ? "grid-cols-1" :
            "grid-cols-2"
          }`}>
            {post.media_urls.map((url, index) => {
              const isVideo = url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
              return isVideo ? (
                <div
                  key={index}
                  className="cursor-pointer rounded-lg overflow-hidden"
                  onClick={() => setMediaPreview({ url, isVideo: true })}
                >
                  <video
                    src={url}
                    className="w-full rounded-lg object-contain max-h-[500px]"
                    muted
                    playsInline
                  />
                </div>
              ) : (
                <img
                  key={index}
                  src={url}
                  alt=""
                  className="w-full rounded-lg object-contain max-h-[500px] cursor-pointer hover:opacity-90 transition-opacity bg-secondary"
                  onClick={() => setMediaPreview({ url, isVideo: false })}
                />
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate()}
            disabled={!user || likeMutation.isPending}
            className={post.user_has_liked ? "text-red-500" : "text-muted-foreground"}
          >
            <Heart className={`w-4 h-4 mr-2 ${post.user_has_liked ? "fill-current" : ""}`} />
            {post.likes_count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {post.comments_count}
          </Button>
        </div>

        {/* Comments */}
        {showComments && <CommentsSection postId={post.id} />}

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Media Lightbox */}
        <Dialog open={!!mediaPreview} onOpenChange={() => setMediaPreview(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-none overflow-hidden flex items-center justify-center">
            <button
              onClick={() => setMediaPreview(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {mediaPreview?.isVideo ? (
              <video
                src={mediaPreview.url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] object-contain"
              />
            ) : (
              <img
                src={mediaPreview?.url}
                alt=""
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PostCard;
