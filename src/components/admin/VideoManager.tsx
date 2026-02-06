import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import VideoCategoryForm from "./VideoCategoryForm";
import VideoForm from "./VideoForm";
import SortableVideoCategory from "./SortableVideoCategory";
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    setExpandedCategories((prev) => {
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
      const { error } = await supabase.from("videos").delete().eq("id", videoId);

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
    return videos?.filter((v) => v.category_id === categoryId) || [];
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

  // Handle category reorder via drag and drop
  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && categories) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const newCategories = [...categories];
      const [removed] = newCategories.splice(oldIndex, 1);
      newCategories.splice(newIndex, 0, removed);

      // Optimistically update UI
      queryClient.setQueryData(["admin-video-categories"], newCategories);

      // Update each category's display_order in the database
      try {
        const updates = newCategories.map((cat, index) => ({
          id: cat.id,
          display_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from("video_categories")
            .update({ display_order: update.display_order })
            .eq("id", update.id);
        }

        toast({ title: "Categories reordered" });
        queryClient.invalidateQueries({ queryKey: ["video-categories"] });
      } catch (error) {
        console.error("Error reordering categories:", error);
        toast({
          title: "Error reordering categories",
          variant: "destructive",
        });
        queryClient.invalidateQueries({ queryKey: ["admin-video-categories"] });
      }
    }
  };

  // Handle video reorder within a category
  const handleReorderVideos = async (updatedVideos: Video[]) => {
    // Optimistically update UI
    queryClient.setQueryData(["admin-videos"], (old: Video[] | undefined) => {
      if (!old) return updatedVideos;
      const otherVideos = old.filter(
        (v) => !updatedVideos.some((uv) => uv.id === v.id)
      );
      return [...otherVideos, ...updatedVideos];
    });

    try {
      for (const video of updatedVideos) {
        await supabase
          .from("videos")
          .update({ display_order: video.display_order })
          .eq("id", video.id);
      }

      toast({ title: "Videos reordered" });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    } catch (error) {
      console.error("Error reordering videos:", error);
      toast({
        title: "Error reordering videos",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {categories.map((category) => {
                  const categoryVideos = getVideosByCategory(category.id);
                  const isExpanded = expandedCategories.has(category.id);

                  return (
                    <SortableVideoCategory
                      key={category.id}
                      category={category}
                      videos={categoryVideos}
                      isExpanded={isExpanded}
                      onToggleExpanded={() => toggleCategory(category.id)}
                      onEdit={() => handleEditCategory(category)}
                      onDelete={() => handleDeleteCategory(category.id)}
                      onTogglePublished={() => handleToggleCategoryPublished(category)}
                      onAddVideo={() => handleAddVideo(category.id)}
                      onEditVideo={handleEditVideo}
                      onDeleteVideo={handleDeleteVideo}
                      onToggleVideoPublished={handleToggleVideoPublished}
                      onReorderVideos={handleReorderVideos}
                      getIcon={getIcon}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
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
