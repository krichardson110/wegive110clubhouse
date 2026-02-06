import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

interface VideoCategory {
  id: string;
  name: string;
}

interface VideoFormProps {
  video: Video | null;
  categories: VideoCategory[];
  defaultCategoryId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VideoForm = ({ video, categories, defaultCategoryId, open, onOpenChange }: VideoFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: "",
    youtube_id: "",
    duration: "",
    display_order: 0,
    published: true,
  });

  useEffect(() => {
    if (video) {
      setFormData({
        category_id: video.category_id,
        title: video.title,
        description: video.description || "",
        youtube_id: video.youtube_id,
        duration: video.duration || "",
        display_order: video.display_order,
        published: video.published,
      });
    } else {
      setFormData({
        category_id: defaultCategoryId || categories[0]?.id || "",
        title: "",
        description: "",
        youtube_id: "",
        duration: "",
        display_order: 0,
        published: true,
      });
    }
  }, [video, open, defaultCategoryId, categories]);

  // Extract YouTube ID from URL or use as-is
  const parseYouTubeId = (input: string): string => {
    if (!input) return "";
    
    // Already a video ID (no slashes or special chars)
    if (/^[\w-]{11}$/.test(input)) return input;
    
    // Try to extract from URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    
    return input;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const youtubeId = parseYouTubeId(formData.youtube_id);
    
    if (!youtubeId) {
      toast({
        title: "Invalid YouTube ID or URL",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        youtube_id: youtubeId,
        description: formData.description || null,
        duration: formData.duration || null,
      };

      if (video) {
        const { error } = await supabase
          .from("videos")
          .update(dataToSave)
          .eq("id", video.id);
        
        if (error) throw error;
        toast({ title: "Video updated successfully" });
      } else {
        const { error } = await supabase
          .from("videos")
          .insert(dataToSave);
        
        if (error) throw error;
        toast({ title: "Video added successfully" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error saving video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const youtubeId = parseYouTubeId(formData.youtube_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {video ? "Edit Video" : "Add Video"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Video title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the video"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube_id">YouTube URL or Video ID</Label>
            <Input
              id="youtube_id"
              value={formData.youtube_id}
              onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
              placeholder="https://youtube.com/watch?v=... or video ID"
              required
            />
            {youtubeId && (
              <div className="mt-2 rounded-lg overflow-hidden bg-secondary">
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 5:30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.category_id}>
              {loading ? "Saving..." : video ? "Update" : "Add Video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoForm;
