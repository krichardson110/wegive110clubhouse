import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutCategory, iconMap } from "@/types/workout";
import { Dumbbell, Timer, Flame, Target, Zap, Heart } from "lucide-react";

interface WorkoutCategoryFormProps {
  category?: WorkoutCategory | null;
  onSubmit: (data: Partial<WorkoutCategory>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const colorOptions = [
  { value: "from-red-500/20 to-red-600/20 border-red-500/40", label: "Red" },
  { value: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/40", label: "Yellow" },
  { value: "from-pink-500/20 to-pink-600/20 border-pink-500/40", label: "Pink" },
  { value: "from-accent/20 to-clubhouse-orange-light/20 border-accent/40", label: "Orange" },
  { value: "from-primary/20 to-clubhouse-purple-light/20 border-primary/40", label: "Purple" },
  { value: "from-teal-500/20 to-teal-600/20 border-teal-500/40", label: "Teal" },
  { value: "from-blue-500/20 to-blue-600/20 border-blue-500/40", label: "Blue" },
  { value: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/40", label: "Green" },
];

const iconOptions = [
  { value: "Dumbbell", label: "Dumbbell", icon: Dumbbell },
  { value: "Zap", label: "Lightning", icon: Zap },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Target", label: "Target", icon: Target },
  { value: "Flame", label: "Flame", icon: Flame },
  { value: "Timer", label: "Timer", icon: Timer },
];

const WorkoutCategoryForm = ({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: WorkoutCategoryFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon_name: "Dumbbell",
    color_gradient: colorOptions[0].value,
    published: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        icon_name: category.icon_name,
        color_gradient: category.color_gradient,
        published: category.published,
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Strength Training"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this category..."
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
            <SelectContent>
              {iconOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
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
              {colorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${option.value}`} />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="published"
          checked={formData.published}
          onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
        />
        <Label htmlFor="published">Published</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : category ? "Update Category" : "Add Category"}
        </Button>
      </div>
    </form>
  );
};

export default WorkoutCategoryForm;
