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
import { Target, Flame, Dumbbell, Brain, Heart, Users, Video, Trophy, Zap, Star, Award, Shield, Crosshair, Timer, Activity } from "lucide-react";

interface VideoCategory {
  id: string;
  name: string;
  description: string | null;
  icon_name: string;
  color_gradient: string;
  display_order: number;
  published: boolean;
}

interface VideoCategoryFormProps {
  category: VideoCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconOptions = [
  { value: "Target", label: "Target", icon: Target },
  { value: "Flame", label: "Flame", icon: Flame },
  { value: "Dumbbell", label: "Dumbbell", icon: Dumbbell },
  { value: "Brain", label: "Brain", icon: Brain },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Users", label: "Users", icon: Users },
  { value: "Video", label: "Video", icon: Video },
  { value: "Trophy", label: "Trophy", icon: Trophy },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "Star", label: "Star", icon: Star },
  { value: "Award", label: "Award", icon: Award },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Crosshair", label: "Crosshair", icon: Crosshair },
  { value: "Timer", label: "Timer", icon: Timer },
  { value: "Activity", label: "Activity", icon: Activity },
];

const colorOptions = [
  { value: "from-accent/20 to-clubhouse-orange-light/20 border-accent/40", label: "Orange (Hitting)" },
  { value: "from-red-500/20 to-red-600/20 border-red-500/40", label: "Red (Pitching)" },
  { value: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/40", label: "Green (Fielding)" },
  { value: "from-blue-500/20 to-blue-600/20 border-blue-500/40", label: "Blue (Mental)" },
  { value: "from-primary/20 to-clubhouse-purple-light/20 border-primary/40", label: "Purple (Leadership)" },
  { value: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/40", label: "Indigo (Meetings)" },
  { value: "from-amber-500/20 to-amber-600/20 border-amber-500/40", label: "Amber" },
  { value: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/40", label: "Cyan" },
];

const VideoCategoryForm = ({ category, open, onOpenChange }: VideoCategoryFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon_name: "Video",
    color_gradient: "from-accent/20 to-clubhouse-orange-light/20 border-accent/40",
    display_order: 0,
    published: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        icon_name: category.icon_name,
        color_gradient: category.color_gradient,
        display_order: category.display_order,
        published: category.published,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        icon_name: "Video",
        color_gradient: "from-accent/20 to-clubhouse-orange-light/20 border-accent/40",
        display_order: 0,
        published: true,
      });
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category) {
        const { error } = await supabase
          .from("video_categories")
          .update(formData)
          .eq("id", category.id);
        
        if (error) throw error;
        toast({ title: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from("video_categories")
          .insert(formData);
        
        if (error) throw error;
        toast({ title: "Category created successfully" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-video-categories"] });
      queryClient.invalidateQueries({ queryKey: ["video-categories"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error saving category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = iconOptions.find(i => i.value === formData.icon_name)?.icon || Video;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hitting Drills"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon_name}
                onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <SelectedIcon className="w-4 h-4" />
                      {formData.icon_name}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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

          <div className="space-y-2">
            <Label>Color Theme</Label>
            <Select
              value={formData.color_gradient}
              onValueChange={(value) => setFormData({ ...formData, color_gradient: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded bg-gradient-to-r ${option.value.split(' ').slice(0, 2).join(' ')}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCategoryForm;
