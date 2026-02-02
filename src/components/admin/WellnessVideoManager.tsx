import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Flame, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import WellnessVideoForm from "./WellnessVideoForm";
import { Skeleton } from "@/components/ui/skeleton";

interface WellnessVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  duration: string | null;
  category: string;
  display_order: number;
  published: boolean;
}

const WellnessVideoManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("mind");
  const [formOpen, setFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<WellnessVideo | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["admin-wellness-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wellness_videos")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as WellnessVideo[];
    },
  });

  const groupedVideos = {
    mind: videos?.filter(v => v.category === "mind") || [],
    body: videos?.filter(v => v.category === "body") || [],
    spirit: videos?.filter(v => v.category === "spirit") || [],
  };

  const handleEdit = (video: WellnessVideo) => {
    setEditingVideo(video);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingVideo(null);
    setFormOpen(true);
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from("wellness_videos")
        .delete()
        .eq("id", videoId);
      
      if (error) throw error;
      
      toast({ title: "Video deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-wellness-videos"] });
      queryClient.invalidateQueries({ queryKey: ["wellness-videos"] });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error deleting video",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublished = async (video: WellnessVideo) => {
    try {
      const { error } = await supabase
        .from("wellness_videos")
        .update({ published: !video.published })
        .eq("id", video.id);
      
      if (error) throw error;
      
      toast({ title: video.published ? "Video unpublished" : "Video published" });
      queryClient.invalidateQueries({ queryKey: ["admin-wellness-videos"] });
      queryClient.invalidateQueries({ queryKey: ["wellness-videos"] });
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error updating video",
        variant: "destructive",
      });
    }
  };

  const categoryConfig = {
    mind: { icon: Brain, label: "Mind", color: "text-blue-500" },
    body: { icon: Flame, label: "Body", color: "text-accent" },
    spirit: { icon: Heart, label: "Spirit", color: "text-primary" },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Develop Your Whole Self Videos</CardTitle>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = groupedVideos[key as keyof typeof groupedVideos]?.length || 0;
              return (
                <TabsTrigger key={key} value={key} className="gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  {config.label}
                  <span className="text-xs text-muted-foreground">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            Object.entries(groupedVideos).map(([category, categoryVideos]) => (
              <TabsContent key={category} value={category} className="space-y-3">
                {categoryVideos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {category} videos yet. Add one to get started.
                  </div>
                ) : (
                  categoryVideos.map((video) => (
                    <div
                      key={video.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        video.published ? "bg-card" : "bg-muted/50 opacity-75"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-secondary">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{video.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {video.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {video.duration && <span>{video.duration}</span>}
                          <span>•</span>
                          <span>Order: {video.display_order}</span>
                          {!video.published && (
                            <>
                              <span>•</span>
                              <span className="text-yellow-500">Draft</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublished(video)}
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
                          onClick={() => handleEdit(video)}
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
                                Are you sure you want to delete "{video.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(video.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            ))
          )}
        </Tabs>
      </CardContent>

      <WellnessVideoForm
        video={editingVideo}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </Card>
  );
};

export default WellnessVideoManager;
