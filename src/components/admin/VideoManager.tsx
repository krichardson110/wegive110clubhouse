import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, ChevronDown, ChevronRight, FolderPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoCategoryForm from "./VideoCategoryForm";
import VideoForm from "./VideoForm";
import * as Icons from "lucide-react";

interface VideoCategory {
  id: string;
  name: string;
  description: string | null;
  icon_name: string;
  color_gradient: string;
  display_order: number;
  published: boolean;
}

interface Video {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  duration: string | null;
  display_order: number;
  published: boolean;
}

const VideoManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VideoCategory | null>(null);
  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [addingToCategory, setAddingToCategory] = useState<string | undefined>();

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-video-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_categories")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as VideoCategory[];
    },
  });

  const { data: videos, isLoading: loadingVideos } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as Video[];
    },
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: VideoCategory) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("video_categories")
        .delete()
        .eq("id", categoryId);
      
      if (error) throw error;
      
      toast({ title: "Category deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-video-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error deleting category",
        description: "Make sure all videos are removed first.",
        variant: "destructive",
      });
    }
  };

  const handleToggleCategoryPublished = async (category: VideoCategory) => {
    try {
      const { error } = await supabase
        .from("video_categories")
        .update({ published: !category.published })
        .eq("id", category.id);
      
      if (error) throw error;
      
      toast({ title: category.published ? "Category unpublished" : "Category published" });
      queryClient.invalidateQueries({ queryKey: ["admin-video-categories"] });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error updating category",
        variant: "destructive",
      });
    }
  };

  const handleAddVideo = (categoryId?: string) => {
    setEditingVideo(null);
    setAddingToCategory(categoryId);
    setVideoFormOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setAddingToCategory(undefined);
    setVideoFormOpen(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);
      
      if (error) throw error;
      
      toast({ title: "Video deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error deleting video",
        variant: "destructive",
      });
    }
  };

  const handleToggleVideoPublished = async (video: Video) => {
    try {
      const { error } = await supabase
        .from("videos")
        .update({ published: !video.published })
        .eq("id", video.id);
      
      if (error) throw error;
      
      toast({ title: video.published ? "Video unpublished" : "Video published" });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error updating video",
        variant: "destructive",
      });
    }
  };

  const getVideosByCategory = (categoryId: string) => {
    return videos?.filter(v => v.category_id === categoryId) || [];
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      Target: Icons.Target,
      Flame: Icons.Flame,
      Dumbbell: Icons.Dumbbell,
      Brain: Icons.Brain,
      Heart: Icons.Heart,
      Users: Icons.Users,
      Video: Icons.Video,
      Trophy: Icons.Trophy,
      Zap: Icons.Zap,
      Star: Icons.Star,
      Award: Icons.Award,
      Shield: Icons.Shield,
      Crosshair: Icons.Crosshair,
      Timer: Icons.Timer,
      Activity: Icons.Activity,
    };
    return iconMap[iconName] || Icons.Video;
  };

  const isLoading = loadingCategories || loadingVideos;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Video Library</CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleAddCategory} variant="outline" size="sm">
            <FolderPlus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => handleAddVideo()} size="sm" disabled={!categories?.length}>
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !categories?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No categories yet. Add a category to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryVideos = getVideosByCategory(category.id);
              const isExpanded = expandedCategories.has(category.id);
              const Icon = getIcon(category.icon_name);

              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <div className={`rounded-lg border ${category.published ? "" : "opacity-60"}`}>
                    <CollapsibleTrigger asChild>
                      <div
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 rounded-t-lg bg-gradient-to-r ${category.color_gradient}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                        
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {categoryVideos.length} video{categoryVideos.length !== 1 ? "s" : ""}
                            {!category.published && " • Draft"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleCategoryPublished(category)}
                            title={category.published ? "Unpublish" : "Publish"}
                          >
                            {category.published ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAddVideo(category.id)}
                            title="Add video to category"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                            title="Edit category"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Delete category">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This will also delete all {categoryVideos.length} videos in this category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t">
                        {categoryVideos.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            No videos in this category yet.
                          </div>
                        ) : (
                          <div className="divide-y">
                            {categoryVideos.map((video) => (
                              <div
                                key={video.id}
                                className={`flex items-center gap-3 p-3 ${
                                  video.published ? "" : "opacity-60"
                                }`}
                              >
                                <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-secondary">
                                  <img
                                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm truncate">{video.title}</h5>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {video.duration && <span>{video.duration}</span>}
                                    {!video.published && (
                                      <>
                                        <span>•</span>
                                        <span className="text-yellow-500">Draft</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleVideoPublished(video)}
                                    title={video.published ? "Unpublish" : "Publish"}
                                  >
                                    {video.published ? (
                                      <Eye className="w-4 h-4" />
                                    ) : (
                                      <EyeOff className="w-4 h-4" />
                                    )}
                                  </Button>
                                  
                                  <a
                                    href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="icon" title="Watch on YouTube">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </a>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditVideo(video)}
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" title="Delete">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{video.title}"?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteVideo(video.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>

      <VideoCategoryForm
        category={editingCategory}
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
      />

      <VideoForm
        video={editingVideo}
        categories={categories || []}
        defaultCategoryId={addingToCategory}
        open={videoFormOpen}
        onOpenChange={setVideoFormOpen}
      />
    </Card>
  );
};

export default VideoManager;
