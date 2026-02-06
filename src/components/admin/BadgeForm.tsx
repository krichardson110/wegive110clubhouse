import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Badge } from "@/types/community";
import * as LucideIcons from "lucide-react";

interface BadgeFormProps {
  badge?: Badge | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Badge>) => void;
  isLoading?: boolean;
}

// Baseball-themed icons available in Lucide
const baseballIcons = [
  { name: "Trophy", label: "Trophy" },
  { name: "Medal", label: "Medal" },
  { name: "Award", label: "Award" },
  { name: "Star", label: "Star" },
  { name: "Crown", label: "Crown" },
  { name: "Target", label: "Target" },
  { name: "Flame", label: "Flame" },
  { name: "Zap", label: "Lightning" },
  { name: "Shield", label: "Shield" },
  { name: "Swords", label: "Crossed Bats" },
  { name: "Timer", label: "Timer" },
  { name: "TrendingUp", label: "Rising Star" },
  { name: "Users", label: "Team" },
  { name: "Heart", label: "Heart" },
  { name: "ThumbsUp", label: "Thumbs Up" },
  { name: "MessageCircle", label: "Commenter" },
  { name: "Sparkles", label: "Sparkles" },
  { name: "Gem", label: "Diamond" },
  { name: "CircleDot", label: "Ball" },
  { name: "Home", label: "Home Run" },
  { name: "Flag", label: "Flag" },
  { name: "Rocket", label: "Rocket" },
  { name: "Dumbbell", label: "Strength" },
  { name: "Brain", label: "Game IQ" },
];

const colorGradients = [
  { value: "from-amber-500 to-yellow-400", label: "Gold" },
  { value: "from-slate-400 to-slate-300", label: "Silver" },
  { value: "from-amber-700 to-amber-500", label: "Bronze" },
  { value: "from-red-600 to-red-400", label: "Red (Cardinals)" },
  { value: "from-blue-600 to-blue-400", label: "Blue (Dodgers)" },
  { value: "from-emerald-600 to-emerald-400", label: "Green (Athletics)" },
  { value: "from-orange-600 to-orange-400", label: "Orange (Giants)" },
  { value: "from-purple-600 to-purple-400", label: "Purple (Rockies)" },
  { value: "from-rose-600 to-pink-400", label: "Pink" },
  { value: "from-cyan-500 to-teal-400", label: "Teal (Mariners)" },
  { value: "from-primary to-accent", label: "Team Primary" },
];

const BadgeForm = ({ badge, open, onClose, onSubmit, isLoading }: BadgeFormProps) => {
  const [formData, setFormData] = useState({
    name: badge?.name || "",
    description: badge?.description || "",
    icon_name: badge?.icon_name || "Trophy",
    color_gradient: badge?.color_gradient || "from-amber-500 to-yellow-400",
    badge_type: (badge?.badge_type || "manual") as "manual" | "automatic",
    display_order: badge?.display_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const SelectedIcon = (LucideIcons[formData.icon_name as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>) || LucideIcons.Award;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{badge ? "Edit Badge" : "Create New Badge"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          <div className="flex items-center justify-center py-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${formData.color_gradient} flex items-center justify-center shadow-lg`}>
              <SelectedIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Badge Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grand Slam"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What this badge represents..."
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {baseballIcons.map((icon) => {
                    const IconComponent = LucideIcons[icon.name as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
                    return (
                      <SelectItem key={icon.name} value={icon.name}>
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          {icon.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select
                value={formData.color_gradient}
                onValueChange={(value) => setFormData({ ...formData, color_gradient: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorGradients.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Badge Type</Label>
              <Select
                value={formData.badge_type}
                onValueChange={(value: "manual" | "automatic") => setFormData({ ...formData, badge_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (Coach Awards)</SelectItem>
                  <SelectItem value="automatic">Automatic (Milestone)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : badge ? "Update Badge" : "Create Badge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeForm;
