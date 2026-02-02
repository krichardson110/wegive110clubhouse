import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

interface WellnessVideoFormProps {
  video?: WellnessVideo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WellnessVideoForm = ({ video, open, onOpenChange }: WellnessVideoFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: video?.title || "",
    description: video?.description || "",
    youtube_id: video?.youtube_id || "",
    duration: video?.duration || "",
    category: video?.category || "mind",
    display_order: video?.display_order || 0,
    published: video?.published ?? true,
  });

  const extractYouTubeId = (input: string): string => {
    // If it's already just an ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }
    // Try to extract from URL
    const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const youtubeId = extractYouTubeId(formData.youtube_id);
      
      const payload = {
        title: formData.title,
        description: formData.description || null,
        youtube_id: youtubeId,
        duration: formData.duration || null,
        category: formData.category,
        display_order: formData.display_order,
        published: formData.published,
      };

      if (video) {
        const { error } = await supabase
          .from("wellness_videos")
          .update(payload)
          .eq("id", video.id);
        
        if (error) throw error;
        toast({ title: "Video updated successfully" });
      } else {
        const { error } = await supabase
          .from("wellness_videos")
          .insert(payload);
        
        if (error) throw error;
        toast({ title: "Video added successfully" });
      }

      queryClient.invalidateQueries({ queryKey: ["wellness-videos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-wellness-videos"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error saving video",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{video ? "Edit Video" : "Add New Video"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Video title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube_id">YouTube URL or ID *</Label>
            <Input
              id="youtube_id"
              value={formData.youtube_id}
              onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
              placeholder="https://youtube.com/watch?v=... or video ID"
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
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mind">Mind</SelectItem>
                  <SelectItem value="body">Body</SelectItem>
                  <SelectItem value="spirit">Spirit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 12:34"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>

          {/* Preview */}
          {formData.youtube_id && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                <img
                  src={`https://img.youtube.com/vi/${extractYouTubeId(formData.youtube_id)}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : video ? "Update Video" : "Add Video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WellnessVideoForm;
